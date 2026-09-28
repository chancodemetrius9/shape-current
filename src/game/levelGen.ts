import { COLS, ROWS, SLACK_CHALLENGE, SLACK_NORMAL } from '../constants/config';
import { SHAPE_COLORS, ShapeKind } from '../constants/theme';
import { Dir, DOWN, LEFT, RIGHT, TileType, UP, solveOrientation, tapsToRestore } from './tiles';
import { makeRng } from '../utils/rng';

export type Cell = { r: number; c: number };

export type TileState = {
  type: TileType;
  rotation: number;
  solvedRotation: number;
  locked: boolean;
  onPath: boolean;
  lane: number; // -1 = decorative
};

export type LaneSpec = {
  kind: ShapeKind;
  color: string;
  srcCol: number;
  dstCol: number;
  path: Cell[];
};

export type Level = {
  index: number;
  grid: TileState[][];
  lanes: LaneSpec[];
  requiredTaps: number;
  moveLimit: number;
};

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle'];

/**
 * Levels are built CONSTRUCTIVELY, never generate-then-check: every shape gets
 * its own contiguous column band, a wandering source-to-dock route is laid
 * inside that band (bands never touch, so routes can never collide), tiles are
 * derived from the route, and only then are orientations scrambled. The
 * solution therefore always exists and is simply "unwind the scramble".
 */
function bandLayout(rng: ReturnType<typeof makeRng>): Array<[number, number]> {
  const shapes: number[][] = [
    [2, 2, 1],
    [2, 1, 2],
    [1, 2, 2],
  ];
  const widths = rng.pick(shapes);
  const bands: Array<[number, number]> = [];
  let c = 0;
  for (const w of widths) {
    bands.push([c, c + w - 1]);
    c += w;
  }
  return bands;
}

function routeCells(colsByRow: number[]): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    const from = colsByRow[r];
    const to = r < ROWS - 1 ? colsByRow[r + 1] : colsByRow[r];
    const step = to === from ? 0 : to > from ? 1 : -1;
    let c = from;
    cells.push({ r, c });
    while (c !== to) {
      c += step;
      cells.push({ r, c });
    }
  }
  return cells;
}

function dirBetween(a: Cell, b: Cell): Dir {
  if (b.r > a.r) return DOWN;
  if (b.r < a.r) return UP;
  if (b.c > a.c) return RIGHT;
  return LEFT;
}

function flip(d: Dir): Dir {
  return (((d + 2) % 4) as Dir);
}

export function buildLevel(index: number, challenge: boolean): Level {
  const rng = makeRng(0x5ca1ab1e + index * 7919);
  const bands = bandLayout(rng);

  const grid: TileState[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: TileState[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        type: 'NONE',
        rotation: 0,
        solvedRotation: 0,
        locked: true,
        onPath: false,
        lane: -1,
      });
    }
    grid.push(row);
  }

  const lanes: LaneSpec[] = [];

  bands.forEach((band, laneIdx) => {
    const [c0, c1] = band;
    const span = c1 - c0 + 1;
    const colsByRow: number[] = [];
    for (let r = 0; r < ROWS; r++) colsByRow.push(c0 + rng.int(span));
    const path = routeCells(colsByRow);

    const required: Dir[][] = path.map(() => []);
    required[0].push(UP);
    for (let i = 0; i < path.length - 1; i++) {
      const d = dirBetween(path[i], path[i + 1]);
      required[i].push(d);
      required[i + 1].push(flip(d));
    }
    required[path.length - 1].push(DOWN);

    path.forEach((cell, i) => {
      const { type, rotation } = solveOrientation(required[i]);
      grid[cell.r][cell.c] = {
        type,
        rotation,
        solvedRotation: rotation,
        locked: false,
        onPath: true,
        lane: laneIdx,
      };
    });

    lanes.push({
      kind: KINDS[laneIdx],
      color: SHAPE_COLORS[KINDS[laneIdx]],
      srcCol: colsByRow[0],
      dstCol: colsByRow[ROWS - 1],
      path,
    });
  });

  // Decorative filler on every cell no route uses.
  const decorTypes: TileType[] = ['I', 'L', 'L', 'T', 'NONE'];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].onPath) continue;
      const type = rng.pick(decorTypes);
      const rotation = rng.int(4);
      grid[r][c] = {
        type,
        rotation,
        solvedRotation: rotation,
        locked: type === 'NONE',
        onPath: false,
        lane: -1,
      };
    }
  }

  // Scramble route tiles. Difficulty ramps with level, capped so the move
  // budget stays comfortably reachable inside one round.
  // Most scrambles are one tap away from correct; a minority need two or
  // three. Keeps the required-tap count in the 8-18 range instead of the 30s.
  const DELTAS = [3, 3, 3, 2, 1];
  const pScramble = Math.min(0.55, 0.28 + index * 0.035);
  const routeCellsAll: Cell[] = lanes.flatMap(l => l.path);
  let scrambled = 0;
  for (const cell of routeCellsAll) {
    const t = grid[cell.r][cell.c];
    if (t.type === 'I') {
      if (rng.next() < pScramble) {
        t.rotation = (t.rotation + 1) % 4;
        scrambled += 1;
      }
    } else if (rng.next() < pScramble) {
      t.rotation = (t.rotation + rng.pick(DELTAS)) % 4;
      scrambled += 1;
    }
  }
  if (scrambled < 3) {
    for (const cell of routeCellsAll) {
      if (scrambled >= 3) break;
      const t = grid[cell.r][cell.c];
      if (t.rotation === t.solvedRotation) {
        t.rotation = (t.rotation + 1) % 4;
        scrambled += 1;
      }
    }
  }

  // A couple of already-correct route tiles are pinned: reads as "fixed
  // plumbing", and rotating them is refused without spending a move.
  let pinned = 0;
  for (const cell of routeCellsAll) {
    if (pinned >= 2) break;
    const t = grid[cell.r][cell.c];
    if (t.rotation === t.solvedRotation && !t.locked) {
      t.locked = true;
      pinned += 1;
    }
  }

  let requiredTaps = 0;
  for (const cell of routeCellsAll) {
    const t = grid[cell.r][cell.c];
    if (t.locked) continue;
    requiredTaps += tapsToRestore(t.type, t.rotation, t.solvedRotation);
  }

  const slack = challenge ? SLACK_CHALLENGE : SLACK_NORMAL;
  return {
    index,
    grid,
    lanes,
    requiredTaps,
    moveLimit: requiredTaps + slack,
  };
}

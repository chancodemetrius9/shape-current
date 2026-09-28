import { COLS, ROWS } from '../constants/config';
import { Cell, LaneSpec, TileState } from './levelGen';
import { DOWN, Dir, UP, connections, delta, opposite } from './tiles';

export type LaneOutcome = 'docked' | 'lost';

export type LaneRun = {
  lane: number;
  trail: Cell[];
  outcome: LaneOutcome;
};

export type FlowResult = {
  runs: LaneRun[];
  docked: number;
  won: boolean;
};

const MAX_STEPS = ROWS * COLS * 2;

/** Prefer going straight on, then clockwise — deterministic on T/X junctions. */
function pickExit(conns: Dir[], entry: Dir): Dir | null {
  const forward = opposite(entry);
  const outs = conns.filter(d => d !== entry);
  if (outs.length === 0) return null;
  if (outs.indexOf(forward) >= 0) return forward;
  return outs[0];
}

/**
 * Walks every shape one tile per tick so two shapes meeting inside the same
 * tile on the same tick can be detected as a collision.
 */
export function simulateFlow(grid: TileState[][], lanes: LaneSpec[]): FlowResult {
  type Walker = {
    lane: number;
    r: number;
    c: number;
    entry: Dir;
    trail: Cell[];
    done: boolean;
    outcome: LaneOutcome;
  };

  const walkers: Walker[] = lanes.map((lane, i) => ({
    lane: i,
    r: 0,
    c: lane.srcCol,
    entry: UP,
    trail: [{ r: 0, c: lane.srcCol }],
    done: false,
    outcome: 'lost',
  }));

  for (let step = 0; step < MAX_STEPS; step++) {
    const active = walkers.filter(w => !w.done);
    if (active.length === 0) break;

    for (const w of active) {
      const tile = grid[w.r][w.c];
      const conns = connections(tile.type, tile.rotation);
      if (conns.indexOf(w.entry) < 0) {
        w.done = true;
        w.outcome = 'lost';
        continue;
      }
      const exit = pickExit(conns, w.entry);
      if (exit === null) {
        w.done = true;
        w.outcome = 'lost';
        continue;
      }
      const { dr, dc } = delta(exit);
      const nr = w.r + dr;
      const nc = w.c + dc;

      if (nr >= ROWS) {
        w.done = true;
        w.outcome = exit === DOWN && lanes[w.lane].dstCol === w.c ? 'docked' : 'lost';
        continue;
      }
      if (nr < 0 || nc < 0 || nc >= COLS) {
        w.done = true;
        w.outcome = 'lost';
        continue;
      }
      w.r = nr;
      w.c = nc;
      w.entry = opposite(exit);
      w.trail.push({ r: nr, c: nc });
    }

    // Head-on / same-tile collision: both shapes are lost.
    const live = walkers.filter(w => !w.done);
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        if (live[i].r === live[j].r && live[i].c === live[j].c) {
          live[i].done = true;
          live[i].outcome = 'lost';
          live[j].done = true;
          live[j].outcome = 'lost';
        }
      }
    }
  }

  for (const w of walkers) {
    if (!w.done) w.outcome = 'lost';
  }

  const runs: LaneRun[] = walkers.map(w => ({
    lane: w.lane,
    trail: w.trail,
    outcome: w.outcome,
  }));
  const docked = runs.filter(r => r.outcome === 'docked').length;
  return { runs, docked, won: docked === lanes.length };
}

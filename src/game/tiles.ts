/** Channel tile vocabulary. Directions: 0=up, 1=right, 2=down, 3=left. */
export type Dir = 0 | 1 | 2 | 3;
export type TileType = 'NONE' | 'I' | 'L' | 'T' | 'X';

export const UP: Dir = 0;
export const RIGHT: Dir = 1;
export const DOWN: Dir = 2;
export const LEFT: Dir = 3;

const BASE: Record<TileType, Dir[]> = {
  NONE: [],
  I: [UP, DOWN],
  L: [UP, RIGHT],
  T: [UP, RIGHT, DOWN],
  X: [UP, RIGHT, DOWN, LEFT],
};

/** How many distinct orientations a type has (I is 2-periodic). */
export const PERIOD: Record<TileType, number> = {
  NONE: 1,
  I: 2,
  L: 4,
  T: 4,
  X: 1,
};

export function connections(type: TileType, rotation: number): Dir[] {
  const r = ((rotation % 4) + 4) % 4;
  return BASE[type].map(d => (((d + r) % 4) as Dir));
}

export function opposite(d: Dir): Dir {
  return (((d + 2) % 4) as Dir);
}

export function delta(d: Dir): { dr: number; dc: number } {
  if (d === UP) return { dr: -1, dc: 0 };
  if (d === RIGHT) return { dr: 0, dc: 1 };
  if (d === DOWN) return { dr: 1, dc: 0 };
  return { dr: 0, dc: -1 };
}

function sameSet(a: Dir[], b: Dir[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join(',');
  const sb = [...b].sort().join(',');
  return sa === sb;
}

/** Type + rotation that realise the requested connection set. */
export function solveOrientation(required: Dir[]): { type: TileType; rotation: number } {
  const order: TileType[] = ['I', 'L', 'T', 'X'];
  for (const type of order) {
    for (let rot = 0; rot < 4; rot++) {
      if (sameSet(connections(type, rot), required)) return { type, rotation: rot };
    }
  }
  return { type: 'NONE', rotation: 0 };
}

/** Clockwise taps needed to bring `rotation` back to `target`. */
export function tapsToRestore(type: TileType, rotation: number, target: number): number {
  const p = PERIOD[type];
  if (p <= 1) return 0;
  const cur = ((rotation % 4) + 4) % 4;
  const tgt = ((target % 4) + 4) % 4;
  let taps = 0;
  let probe = cur;
  while (taps < 4) {
    if (sameSet(connections(type, probe), connections(type, tgt))) return taps;
    probe = (probe + 1) % 4;
    taps += 1;
  }
  return 0;
}

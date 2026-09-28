/** Deterministic xorshift32 — no Math.random inside render paths. */
export function makeRng(seed: number) {
  let s = seed >>> 0;
  if (s === 0) s = 0x9e3779b9;
  return {
    next(): number {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    },
    int(maxExclusive: number): number {
      return Math.floor(this.next() * maxExclusive) % Math.max(1, maxExclusive);
    },
    pick<T>(arr: T[]): T {
      return arr[this.int(arr.length)];
    },
  };
}

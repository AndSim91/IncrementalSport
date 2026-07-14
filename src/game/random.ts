export function nextRandom(seed: number): [value: number, nextSeed: number] {
  let value = (seed + 0x6d2b79f5) | 0;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return [((value ^ (value >>> 14)) >>> 0) / 4_294_967_296, (seed + 0x6d2b79f5) | 0];
}

export function randomBetween(seed: number, min: number, max: number): [number, number] {
  const [value, nextSeed] = nextRandom(seed);
  return [Math.round(min + value * (max - min)), nextSeed];
}

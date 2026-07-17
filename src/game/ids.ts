export function makeGameId(prefix: string, now: number, suffix: number | string): string {
  return `${prefix}-${now.toString(36)}-${suffix}`;
}

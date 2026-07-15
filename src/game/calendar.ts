const GAME_MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
] as const;

export function getGameMonthName(currentMonth: number): string {
  const normalizedMonth = Math.max(1, Math.floor(currentMonth));
  return GAME_MONTH_NAMES[(normalizedMonth - 1) % GAME_MONTH_NAMES.length];
}

export function getGameYear(currentMonth: number): number {
  const normalizedMonth = Math.max(1, Math.floor(currentMonth));
  return Math.floor((normalizedMonth - 1) / GAME_MONTH_NAMES.length) + 1;
}

export function getSchoolYear(currentMonth: number): number {
  const normalizedMonth = Math.max(1, Math.floor(currentMonth));
  return Math.floor((normalizedMonth + 3) / GAME_MONTH_NAMES.length) + 1;
}

export function getSchoolYearStartMonth(schoolYear: number): number {
  const normalizedYear = Math.max(1, Math.floor(schoolYear));
  return normalizedYear === 1 ? 1 : 9 + (normalizedYear - 2) * GAME_MONTH_NAMES.length;
}

export function isSummerBreak(currentMonth: number): boolean {
  const monthIndex = (Math.max(1, Math.floor(currentMonth)) - 1) % GAME_MONTH_NAMES.length;
  return monthIndex === 6 || monthIndex === 7;
}

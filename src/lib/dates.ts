/** Local calendar date as YYYY-MM-DD (not UTC). */

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function shiftDateKey(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function lastNDateKeys(n: number, today: string = localDateKey()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) keys.push(shiftDateKey(today, -i));
  return keys;
}

const WEEKDAY_RO = ["D", "L", "Ma", "Mi", "J", "V", "S"];
const WEEKDAY_EN = ["S", "M", "T", "W", "T", "F", "S"];

export function weekdayShort(dateKey: string, locale: "ro" | "en"): string {
  const day = parseDateKey(dateKey).getDay();
  return locale === "ro" ? WEEKDAY_RO[day] : WEEKDAY_EN[day];
}

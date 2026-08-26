import type { Locale } from "./i18n";

export function localISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return localISO(new Date(y, m - 1, d + days));
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const RO_WEEKDAYS = [
  "duminică",
  "luni",
  "marți",
  "miercuri",
  "joi",
  "vineri",
  "sâmbătă",
];
const RO_MONTHS = [
  "ian",
  "feb",
  "mar",
  "apr",
  "mai",
  "iun",
  "iul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export function formatDiaryDate(iso: string, locale: Locale): string {
  const date = parseISO(iso);
  if (locale === "ro") {
    return `${RO_WEEKDAYS[date.getDay()]}, ${date.getDate()} ${RO_MONTHS[date.getMonth()]}`;
  }
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

/** Monday-first week containing `iso`. */
export function weekISODates(iso = localISO()): string[] {
  const date = parseISO(iso);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) =>
    localISO(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)),
  );
}

export const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export function weekdayKeyFromISO(iso: string): WeekdayKey {
  return WEEKDAY_KEYS[parseISO(iso).getDay()];
}

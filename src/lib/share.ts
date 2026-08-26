import { localISO, shiftISO } from "./dates";
import type { Locale } from "./i18n";
import type { DiaryEntry, ExerciseLog } from "./store";
import type { Macros } from "./foods";

export function dayShareText(input: {
  locale: Locale;
  date: string;
  entries: DiaryEntry[];
  totals: Macros;
  goalKcal: number;
  burned: number;
  waterMl: number;
}): string {
  const ro = input.locale === "ro";
  const lines = [
    ro ? `Farfurie · ${input.date}` : `Farfurie · ${input.date}`,
    `${input.totals.kcal} / ${input.goalKcal} kcal` +
      (input.burned ? (ro ? ` · arse ${input.burned}` : ` · burned ${input.burned}`) : ""),
    `P ${input.totals.protein}g · C ${input.totals.carbs}g · F ${input.totals.fat}g`,
    ro ? `Apă ${input.waterMl} ml` : `Water ${input.waterMl} ml`,
    "",
    ...input.entries.map(
      (e) =>
        `• ${ro ? e.nameRo : e.nameEn} (${e.macros.kcal} kcal)`,
    ),
  ];
  return lines.join("\n");
}

export function nutritionistCsv(input: {
  entries: DiaryEntry[];
  exercises: ExerciseLog[];
  days?: number;
}): string {
  const days = input.days ?? 14;
  const from = shiftISO(localISO(), -(days - 1));
  const rows = [
    ["date", "meal", "name_ro", "name_en", "kcal", "protein", "carbs", "fat"].join(","),
    ...input.entries
      .filter((e) => e.date >= from)
      .map((e) =>
        [
          e.date,
          e.meal,
          csv(e.nameRo),
          csv(e.nameEn),
          e.macros.kcal,
          e.macros.protein,
          e.macros.carbs,
          e.macros.fat,
        ].join(","),
      ),
    "",
    ["date", "exercise", "minutes", "kcal"].join(","),
    ...input.exercises
      .filter((e) => e.date >= from)
      .map((e) => [e.date, csv(e.nameEn), e.minutes, e.kcal].join(",")),
  ];
  return rows.join("\n");
}

function csv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

import { lastNDates, localISO } from "./dates";
import type { ProfileInput } from "./goals";
import type { DiaryEntry, WeightLog } from "./store";

export type DailyReportRow = {
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  weightKg?: number;
  entriesCount: number;
};

export type PdfReportData = {
  days: 7 | 30;
  generatedAt: string;
  profile: ProfileInput;
  goalKcal: number;
  goalProtein: number;
  avgKcal: number;
  avgProtein: number;
  startWeight: number;
  endWeight: number;
  weightDelta: number;
  bmi: number;
  rows: DailyReportRow[];
};

export function generatePdfReportData(input: {
  days: 7 | 30;
  entries: DiaryEntry[];
  weightLogs: WeightLog[];
  waterByDate: Record<string, number>;
  profile: ProfileInput;
  goalKcal: number;
  goalProtein: number;
}): PdfReportData {
  const dates = lastNDates(input.days);
  const dateSet = new Set(dates);

  const entryMap = new Map<
    string,
    { kcal: number; protein: number; carbs: number; fat: number; count: number }
  >();
  input.entries.forEach((e) => {
    if (!dateSet.has(e.date)) return;
    const cur = entryMap.get(e.date) ?? { kcal: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    entryMap.set(e.date, {
      kcal: cur.kcal + e.macros.kcal,
      protein: cur.protein + e.macros.protein,
      carbs: cur.carbs + e.macros.carbs,
      fat: cur.fat + e.macros.fat,
      count: cur.count + 1,
    });
  });

  const weightMap = new Map<string, number>();
  input.weightLogs.forEach((w) => {
    if (dateSet.has(w.date)) {
      weightMap.set(w.date, w.kg);
    }
  });

  const rows: DailyReportRow[] = dates.map((date) => {
    const stats = entryMap.get(date) ?? { kcal: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    return {
      date,
      kcal: Math.round(stats.kcal),
      protein: Math.round(stats.protein * 10) / 10,
      carbs: Math.round(stats.carbs * 10) / 10,
      fat: Math.round(stats.fat * 10) / 10,
      waterMl: input.waterByDate[date] ?? 0,
      weightKg: weightMap.get(date),
      entriesCount: stats.count,
    };
  });

  const activeRows = rows.filter((r) => r.kcal > 0);
  const avgKcal = activeRows.length
    ? Math.round(activeRows.reduce((a, b) => a + b.kcal, 0) / activeRows.length)
    : 0;
  const avgProtein = activeRows.length
    ? Math.round((activeRows.reduce((a, b) => a + b.protein, 0) / activeRows.length) * 10) / 10
    : 0;

  const weightsWithVal = rows.map((r) => r.weightKg).filter((w): w is number => w != null);
  const startWeight = weightsWithVal[0] ?? input.profile.weightKg;
  const endWeight = weightsWithVal[weightsWithVal.length - 1] ?? input.profile.weightKg;
  const weightDelta = Math.round((endWeight - startWeight) * 10) / 10;
  const bmi = Math.round((endWeight / (input.profile.heightCm / 100) ** 2) * 10) / 10;

  return {
    days: input.days,
    generatedAt: localISO(),
    profile: input.profile,
    goalKcal: input.goalKcal,
    goalProtein: input.goalProtein,
    avgKcal,
    avgProtein,
    startWeight,
    endWeight,
    weightDelta,
    bmi,
    rows,
  };
}

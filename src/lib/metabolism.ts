import { lastNDates, shiftISO } from "./dates";
import {
  calcTdee,
  floorKcal,
  macrosForStyle,
  type DietStyle,
  type GoalType,
  type ProfileInput,
} from "./goals";
import type { Macros } from "./foods";

export type WeightPoint = { date: string; kg: number };

export type TrendPoint = {
  date: string;
  scale: number | null;
  trend: number;
};

export type MetabolismReport = {
  formulaTdee: number;
  expenditure: number | null;
  expenditureSource: "data" | "formula";
  loggedDays: number;
  weighIns: number;
  ready: boolean;
  needLogged: number;
  needWeighIns: number;
  avgIntake: number | null;
  weeklyKg: number | null;
  trendNow: number | null;
  scaleNow: number | null;
  series: TrendPoint[];
  suggestedKcal: number;
  suggested: Macros & { waterMl: number };
  etaWeeks: number | null;
  noteRo: string;
  noteEn: string;
};

const KCAL_FAT = 7700;
const KCAL_LEAN = 1800;
const EMA_ALPHA = 0.18;
const WINDOW_DAYS = 21;
const MIN_LOGGED = 7;
const MIN_WEIGH = 4;
const MIN_DAY_KCAL = 800;

export function kcalPerKgFromRate(weeklyKg: number, weightKg: number) {
  const pct = Math.abs(weeklyKg) / Math.max(weightKg, 1);
  if (weeklyKg < 0) {
    const fatFrac = Math.max(0.55, Math.min(0.9, 0.9 - pct * 35));
    return fatFrac * KCAL_FAT + (1 - fatFrac) * KCAL_LEAN;
  }
  if (weeklyKg > 0) {
    const fatFrac = Math.max(0.4, Math.min(0.78, 0.48 + pct * 25));
    return fatFrac * KCAL_FAT + (1 - fatFrac) * KCAL_LEAN;
  }
  return KCAL_FAT;
}

function sortLogs(logs: WeightPoint[]) {
  return [...logs].filter((w) => w.kg >= 30 && w.kg <= 250).sort((a, b) => a.date.localeCompare(b.date));
}

export function interpolateScale(logs: WeightPoint[], from: string, to: string): WeightPoint[] {
  const sorted = sortLogs(logs);
  if (sorted.length === 0) return [];
  const start = from < sorted[0].date ? sorted[0].date : from;
  const end = to > sorted[sorted.length - 1].date ? sorted[sorted.length - 1].date : to;
  const out: WeightPoint[] = [];
  let i = 0;
  for (let date = start; date <= end; date = shiftISO(date, 1)) {
    while (i < sorted.length - 1 && sorted[i + 1].date <= date) i += 1;
    const a = sorted[i];
    const b = sorted[Math.min(i + 1, sorted.length - 1)];
    if (a.date === date) {
      out.push({ date, kg: a.kg });
      continue;
    }
    if (b.date === date) {
      out.push({ date, kg: b.kg });
      continue;
    }
    if (a.date < date && b.date > date) {
      const span = Math.max(1, Date.parse(`${b.date}T00:00:00`) - Date.parse(`${a.date}T00:00:00`));
      const t = (Date.parse(`${date}T00:00:00`) - Date.parse(`${a.date}T00:00:00`)) / span;
      out.push({ date, kg: Math.round((a.kg + (b.kg - a.kg) * t) * 100) / 100 });
    }
  }
  return out;
}

export function exponentialTrend(scale: WeightPoint[], alpha = EMA_ALPHA): TrendPoint[] {
  if (scale.length === 0) return [];
  const series: TrendPoint[] = [];
  let ema = scale[0].kg;
  const byDate = new Map(scale.map((p) => [p.date, p.kg]));
  for (const point of scale) {
    ema = alpha * point.kg + (1 - alpha) * ema;
    series.push({
      date: point.date,
      scale: byDate.get(point.date) ?? null,
      trend: Math.round(ema * 100) / 100,
    });
  }
  return series;
}

function dailyKcal(entries: Array<{ date: string; macros: Macros }>) {
  const map = new Map<string, number>();
  for (const e of entries) {
    map.set(e.date, (map.get(e.date) ?? 0) + e.macros.kcal);
  }
  return map;
}

export function analyzeMetabolism(input: {
  profile: ProfileInput;
  entries: Array<{ date: string; macros: Macros }>;
  weightLogs: WeightPoint[];
  targetWeightKg: number;
  dietStyle: DietStyle;
  weeklyRatePct: number;
  today?: string;
}): MetabolismReport {
  const today = input.today ?? input.weightLogs.at(-1)?.date ?? "";
  const formulaTdee = calcTdee(input.profile);
  const floor = floorKcal(input.profile.sex);
  const windowStart = today ? lastNDates(WINDOW_DAYS, today)[0] : "";
  const kcalByDay = dailyKcal(input.entries);
  const logged = [...kcalByDay.entries()].filter(
    ([date, kcal]) => date >= windowStart && date <= today && kcal >= MIN_DAY_KCAL,
  );
  const weighIns = input.weightLogs.filter((w) => w.date >= windowStart && w.date <= today);
  const scale = interpolateScale(input.weightLogs, windowStart, today);
  const series = exponentialTrend(scale);

  const ready = logged.length >= MIN_LOGGED && weighIns.length >= MIN_WEIGH && series.length >= 7;
  const avgIntake = logged.length
    ? Math.round(logged.reduce((a, [, k]) => a + k, 0) / logged.length)
    : null;

  let weeklyKg: number | null = null;
  let expenditure: number | null = null;
  if (ready && series.length && avgIntake != null) {
    const first = series[0];
    const last = series[series.length - 1];
    const days = Math.max(1, series.length - 1);
    weeklyKg = Math.round(((last.trend - first.trend) / days) * 7 * 100) / 100;
    const density = kcalPerKgFromRate(weeklyKg, last.trend);
    const storedPerDay = ((last.trend - first.trend) * density) / days;
    expenditure = Math.max(floor, Math.round(avgIntake - storedPerDay));
  }

  const source = expenditure != null ? "data" : "formula";
  const burn = expenditure ?? formulaTdee;
  const trendNow = series.at(-1)?.trend ?? input.profile.weightKg;
  const scaleNow = [...input.weightLogs].sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.kg ?? null;

  const sign = input.profile.goal === "gain" ? 1 : input.profile.goal === "lose" ? -1 : 0;
  const desiredWeeklyKg = sign * (input.weeklyRatePct / 100) * trendNow;
  const density = kcalPerKgFromRate(desiredWeeklyKg, trendNow);
  const desiredStoredPerDay = (desiredWeeklyKg * density) / 7;
  let suggestedKcal = Math.round(burn + desiredStoredPerDay);
  suggestedKcal = Math.max(floor, Math.min(burn + 500, suggestedKcal));
  const suggested = macrosForStyle(suggestedKcal, trendNow, input.dietStyle);

  let etaWeeks: number | null = null;
  if (weeklyKg != null && Math.abs(weeklyKg) >= 0.05) {
    const gap = input.targetWeightKg - trendNow;
    if (gap !== 0 && Math.sign(gap) === Math.sign(weeklyKg)) {
      etaWeeks = Math.max(1, Math.round(Math.abs(gap / weeklyKg)));
    }
  }

  const needLogged = Math.max(0, MIN_LOGGED - logged.length);
  const needWeighIns = Math.max(0, MIN_WEIGH - weighIns.length);

  return {
    formulaTdee,
    expenditure,
    expenditureSource: source,
    loggedDays: logged.length,
    weighIns: weighIns.length,
    ready,
    needLogged,
    needWeighIns,
    avgIntake,
    weeklyKg,
    trendNow: series.length ? trendNow : null,
    scaleNow,
    series,
    suggestedKcal,
    suggested,
    etaWeeks,
    noteRo: ready
      ? "Cheltuiala e din calorii logate + trendul de greutate, nu din cât de „cuminte” ai fost față de țintă."
      : `Mai loghează ${needLogged} zile complete și ${needWeighIns} cântăriri — până atunci folosim formula Mifflin.`,
    noteEn: ready
      ? "Expenditure comes from logged calories + the weight trend, not from how closely you hit targets."
      : `Log ${needLogged} more complete days and ${needWeighIns} weigh-ins — until then we use the Mifflin formula.`,
  };
}

export function checkInDue(lastCheckInAt: string | null, today: string) {
  if (!lastCheckInAt) return true;
  const then = lastCheckInAt.slice(0, 10);
  let days = 0;
  for (let d = then; d < today; d = shiftISO(d, 1)) days += 1;
  return days >= 7;
}

export function desiredWeeklyRate(goal: GoalType, pct: number) {
  if (goal === "maintain") return 0;
  return goal === "gain" ? pct : pct;
}

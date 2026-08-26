import { weekISODates } from "./dates";
import type { Macros } from "./foods";

export type WeekBudget = {
  weeklyTarget: number;
  weeklyEaten: number;
  eatenBefore: number;
  daysLeft: number;
  todayKcal: number;
  leftover: number;
  adjusted: boolean;
};

export function weekBudget(input: {
  baseKcal: number;
  entries: Array<{ date: string; macros: Pick<Macros, "kcal"> }>;
  date: string;
  holiday: boolean;
  floor: number;
  ceilingMult?: number;
}): WeekBudget {
  const week = weekISODates(input.date);
  const weeklyTarget = Math.round(input.baseKcal * 7 * (input.holiday ? 1.15 : 1));
  const kcalByDate = new Map<string, number>();
  for (const entry of input.entries) {
    if (!week.includes(entry.date)) continue;
    kcalByDate.set(entry.date, (kcalByDate.get(entry.date) ?? 0) + entry.macros.kcal);
  }
  const before = week.filter((d) => d < input.date);
  const remainingDays = week.filter((d) => d >= input.date);
  const eatenBefore = before.reduce((sum, d) => sum + (kcalByDate.get(d) ?? 0), 0);
  const weeklyEaten = week.reduce((sum, d) => sum + (kcalByDate.get(d) ?? 0), 0);
  const leftover = weeklyTarget - eatenBefore;
  const daysLeft = Math.max(1, remainingDays.length);
  const raw = Math.round(leftover / daysLeft);
  const ceiling = Math.round(input.baseKcal * (input.ceilingMult ?? 1.4));
  const todayKcal = Math.max(input.floor, Math.min(ceiling, raw));
  const unadjusted = input.holiday
    ? Math.round(input.baseKcal * 1.15)
    : input.baseKcal;
  return {
    weeklyTarget,
    weeklyEaten,
    eatenBefore,
    daysLeft,
    todayKcal,
    leftover,
    adjusted: todayKcal !== unadjusted,
  };
}

export type DayGoals = Macros & { waterMl: number };

export function effectiveDayGoals(input: {
  base: DayGoals;
  week: WeekBudget;
  training: boolean;
  recovery: boolean;
}): DayGoals {
  let kcal = input.week.todayKcal;
  if (input.training) kcal += 150;
  const scale = kcal / Math.max(input.base.kcal, 1);
  return {
    kcal,
    protein: input.recovery ? Math.round(input.base.protein * 1.1) : input.base.protein,
    carbs: Math.max(50, Math.round(input.base.carbs * scale)),
    fat: Math.max(25, Math.round(input.base.fat * scale)),
    waterMl: input.base.waterMl,
  };
}

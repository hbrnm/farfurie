"use client";

import { useEffect, useMemo, useState } from "react";
import { localISO, weekISODates, weekdayKeyFromISO } from "./dates";
import { dayKcalFloor } from "./goals";
import { analyzeMetabolism } from "./metabolism";
import { effectiveDayGoals, weekBudget } from "./week-budget";
import { useFarfurieStore, type DayKey, type MealKey } from "./store";

export function useWeekBudget() {
  const goals = useFarfurieStore((s) => s.goals);
  const entries = useFarfurieStore((s) => s.entries);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const profile = useFarfurieStore((s) => s.profile);
  return useMemo(
    () =>
      weekBudget({
        baseKcal: goals.kcal,
        entries,
        date: selectedDate,
        holiday: holidayMode,
        floor: dayKcalFloor(profile),
      }),
    [goals.kcal, entries, selectedDate, holidayMode, profile],
  );
}

export function useEffectiveGoals() {
  const goals = useFarfurieStore((s) => s.goals);
  const recoveryUntil = useFarfurieStore((s) => s.recoveryUntil);
  const trainingDays = useFarfurieStore((s) => s.trainingDays);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const week = useWeekBudget();
  return useMemo(() => {
    const recovery = !!recoveryUntil && localISO() <= recoveryUntil;
    const training = trainingDays.includes(weekdayKeyFromISO(selectedDate) as DayKey);
    return effectiveDayGoals({
      base: goals,
      week,
      training,
      recovery,
    });
  }, [goals, recoveryUntil, trainingDays, selectedDate, week]);
}

export function useDayEntries(date?: string) {
  const entries = useFarfurieStore((s) => s.entries);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const day = date ?? selectedDate;
  return useMemo(
    () => entries.filter((e) => e.date === day),
    [entries, day],
  );
}

export function useTotals(date?: string) {
  const entries = useDayEntries(date);
  return useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          kcal: acc.kcal + e.macros.kcal,
          protein: Math.round((acc.protein + e.macros.protein) * 10) / 10,
          carbs: Math.round((acc.carbs + e.macros.carbs) * 10) / 10,
          fat: Math.round((acc.fat + e.macros.fat) * 10) / 10,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [entries],
  );
}

export function useBurnedToday(date?: string) {
  const exerciseLogs = useFarfurieStore((s) => s.exerciseLogs);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const day = date ?? selectedDate;
  return useMemo(
    () =>
      exerciseLogs
        .filter((e) => e.date === day)
        .reduce((a, e) => a + e.kcal, 0),
    [exerciseLogs, day],
  );
}

export function useRemaining(date?: string) {
  const goals = useEffectiveGoals();
  const totals = useTotals(date);
  return useMemo(() => {
    return {
      kcal: goals.kcal - totals.kcal,
      protein: Math.round((goals.protein - totals.protein) * 10) / 10,
      carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
      fat: Math.round((goals.fat - totals.fat) * 10) / 10,
    };
  }, [goals, totals]);
}

export function useFastingStatus() {
  const fastingProtocolId = useFarfurieStore((s) => s.fastingProtocolId);
  const fastingStartedAt = useFarfurieStore((s) => s.fastingStartedAt);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    void now;
    return useFarfurieStore.getState().fastingStatus();
  }, [fastingProtocolId, fastingStartedAt, now]);
}

export function useMealEntries(meal: MealKey) {
  const entries = useDayEntries();
  return useMemo(() => entries.filter((e) => e.meal === meal), [entries, meal]);
}

export function useCurrentStreak() {
  const entries = useFarfurieStore((s) => s.entries);
  return useMemo(() => useFarfurieStore.getState().currentStreak(), [entries]);
}

export function useWeekKcal() {
  const entries = useFarfurieStore((s) => s.entries);
  return useMemo(
    () =>
      weekISODates(localISO()).map((iso) =>
        entries
          .filter((e) => e.date === iso)
          .reduce((a, e) => a + e.macros.kcal, 0),
      ),
    [entries],
  );
}

export function useMetabolism() {
  const profile = useFarfurieStore((s) => s.profile);
  const entries = useFarfurieStore((s) => s.entries);
  const weightLogs = useFarfurieStore((s) => s.weightLogs);
  const targetWeightKg = useFarfurieStore((s) => s.targetWeightKg);
  const dietStyle = useFarfurieStore((s) => s.dietStyle);
  const weeklyRatePct = useFarfurieStore((s) => s.weeklyRatePct);
  return useMemo(
    () =>
      analyzeMetabolism({
        profile,
        entries,
        weightLogs,
        targetWeightKg,
        dietStyle,
        weeklyRatePct,
        today: localISO(),
      }),
    [profile, entries, weightLogs, targetWeightKg, dietStyle, weeklyRatePct],
  );
}

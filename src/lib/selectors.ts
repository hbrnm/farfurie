"use client";

import { useEffect, useMemo, useState } from "react";
import { localISO, weekISODates } from "./dates";
import { useFarfurieStore, type MealKey } from "./store";

export function useEffectiveGoals() {
  const goals = useFarfurieStore((s) => s.goals);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const recoveryUntil = useFarfurieStore((s) => s.recoveryUntil);
  return useMemo(() => {
    const recovery = !!recoveryUntil && localISO() <= recoveryUntil;
    const kcal = holidayMode ? Math.round(goals.kcal * 1.15) : goals.kcal;
    return {
      kcal,
      protein: recovery ? Math.round(goals.protein * 1.1) : goals.protein,
      carbs: holidayMode ? Math.round(goals.carbs * 1.15) : goals.carbs,
      fat: holidayMode ? Math.round(goals.fat * 1.15) : goals.fat,
      waterMl: goals.waterMl,
    };
  }, [goals, holidayMode, recoveryUntil]);
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
  const burned = useBurnedToday(date);
  return useMemo(() => {
    const budget = goals.kcal + burned;
    return {
      kcal: budget - totals.kcal,
      protein: Math.round((goals.protein - totals.protein) * 10) / 10,
      carbs: Math.round((goals.carbs - totals.carbs) * 10) / 10,
      fat: Math.round((goals.fat - totals.fat) * 10) / 10,
    };
  }, [goals, totals, burned]);
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

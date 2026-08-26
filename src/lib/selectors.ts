"use client";

import { useEffect, useMemo, useState } from "react";
import { useFarfurieStore, type MealKey } from "./store";

export function useEffectiveGoals() {
  const goals = useFarfurieStore((s) => s.goals);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  return useMemo(() => {
    if (!holidayMode) return goals;
    return {
      kcal: Math.round(goals.kcal * 1.15),
      protein: goals.protein,
      carbs: Math.round(goals.carbs * 1.15),
      fat: Math.round(goals.fat * 1.15),
      waterMl: goals.waterMl,
    };
  }, [goals, holidayMode]);
}

export function useTotals() {
  const entries = useFarfurieStore((s) => s.entries);
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

export function useBurnedToday() {
  const exerciseLogs = useFarfurieStore((s) => s.exerciseLogs);
  return useMemo(
    () => exerciseLogs.reduce((a, e) => a + e.kcal, 0),
    [exerciseLogs],
  );
}

export function useRemaining() {
  const goals = useEffectiveGoals();
  const totals = useTotals();
  const burned = useBurnedToday();
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
  const entries = useFarfurieStore((s) => s.entries);
  return useMemo(() => entries.filter((e) => e.meal === meal), [entries, meal]);
}

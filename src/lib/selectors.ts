"use client";

import { useEffect, useMemo, useState } from "react";
import { lastNDateKeys, localDateKey } from "./dates";
import {
  calcStreak,
  kcalOnDate,
  loggedDateKeys,
  onDate,
  pickGapMeal,
  remainingMacros,
  sumMacros,
  type MealKey,
} from "./diary";
import { canUse } from "./entitlements";
import { useFarfurieStore } from "./store";

export function useTodayKey() {
  const [key, setKey] = useState(localDateKey);
  useEffect(() => {
    const tick = () => setKey(localDateKey());
    const id = setInterval(tick, 30_000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return key;
}

export function useEffectiveGoals() {
  const goals = useFarfurieStore((s) => s.goals);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const customMacros = useFarfurieStore((s) => s.customMacros);
  const useCustomMacros = useFarfurieStore((s) => s.useCustomMacros);
  const waterGoalMl = useFarfurieStore((s) => s.waterGoalMl);
  const tier = useFarfurieStore((s) => s.subscriptionTier);
  return useMemo(() => {
    const base =
      useCustomMacros && customMacros && canUse(tier, "customMacros")
        ? customMacros
        : goals;
    const withWater = { ...base, waterMl: waterGoalMl ?? base.waterMl };
    if (!holidayMode) return withWater;
    return {
      kcal: Math.round(withWater.kcal * 1.15),
      protein: withWater.protein,
      carbs: Math.round(withWater.carbs * 1.15),
      fat: Math.round(withWater.fat * 1.15),
      waterMl: withWater.waterMl,
    };
  }, [goals, holidayMode, customMacros, useCustomMacros, waterGoalMl, tier]);
}

export function useTodayEntries() {
  const entries = useFarfurieStore((s) => s.entries);
  const today = useTodayKey();
  return useMemo(() => onDate(entries, today), [entries, today]);
}

export function useTotals() {
  const entries = useTodayEntries();
  return useMemo(() => sumMacros(entries), [entries]);
}

export function useBurnedToday() {
  const exerciseLogs = useFarfurieStore((s) => s.exerciseLogs);
  const today = useTodayKey();
  return useMemo(
    () => onDate(exerciseLogs, today).reduce((a, e) => a + e.kcal, 0),
    [exerciseLogs, today],
  );
}

export function useTodayWater() {
  const waterByDate = useFarfurieStore((s) => s.waterByDate);
  const today = useTodayKey();
  return waterByDate[today] ?? 0;
}

export function useRemaining() {
  const goals = useEffectiveGoals();
  const totals = useTotals();
  return useMemo(() => remainingMacros(goals, totals), [goals, totals]);
}

export function useStreak() {
  const entries = useFarfurieStore((s) => s.entries);
  const today = useTodayKey();
  return useMemo(
    () => calcStreak(loggedDateKeys(entries), today),
    [entries, today],
  );
}

export function useWeekKcal() {
  const entries = useFarfurieStore((s) => s.entries);
  const today = useTodayKey();
  return useMemo(
    () => lastNDateKeys(7, today).map((dateKey) => ({ dateKey, kcal: kcalOnDate(entries, dateKey) })),
    [entries, today],
  );
}

export function useGapMeal() {
  const entries = useTodayEntries();
  return useMemo(() => pickGapMeal(entries), [entries]);
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
    void fastingProtocolId;
    void fastingStartedAt;
    void now;
    return useFarfurieStore.getState().fastingStatus();
  }, [fastingProtocolId, fastingStartedAt, now]);
}

export function useMealEntries(meal: MealKey) {
  const entries = useTodayEntries();
  return useMemo(() => entries.filter((e) => e.meal === meal), [entries, meal]);
}

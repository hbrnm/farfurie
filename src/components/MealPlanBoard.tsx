"use client";

import { useState } from "react";
import Link from "next/link";
import { recipeName, recipes } from "@/lib/recipes";
import { t, type TranslationKey } from "@/lib/i18n";
import {
  WEEK_DAYS,
  type DayKey,
  type MealKey,
  useFarfurieStore,
} from "@/lib/store";

const dayLabels: Record<DayKey, TranslationKey> = {
  mon: "dayMon",
  tue: "dayTue",
  wed: "dayWed",
  thu: "dayThu",
  fri: "dayFri",
  sat: "daySat",
  sun: "daySun",
};

const meals: MealKey[] = ["breakfast", "lunch", "dinner"];

export function MealPlanBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const weekPlan = useFarfurieStore((s) => s.weekPlan);
  const setPlanSlot = useFarfurieStore((s) => s.setPlanSlot);
  const applyTodayPlanToDiary = useFarfurieStore((s) => s.applyTodayPlanToDiary);
  const addWeekPlanToShopping = useFarfurieStore((s) => s.addWeekPlanToShopping);
  const [picking, setPicking] = useState<{ day: DayKey; meal: MealKey } | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl md:text-4xl">{t(locale, "planTitle")}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "planDesc")}</p>
        </div>
        <Link href="/app/market" className="btn btn-ghost text-sm">
          {t(locale, "openMarket")}
        </Link>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary text-sm"
          onClick={() => {
            const added = applyTodayPlanToDiary();
            setNotice(added > 0 ? t(locale, "planAdded") : t(locale, "planApplied"));
          }}
        >
          {t(locale, "applyToday")}
        </button>
        <button
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => {
            addWeekPlanToShopping();
            setNotice(t(locale, "listUpdated"));
          }}
        >
          {t(locale, "planToList")}
        </button>
      </div>
      {notice && <p className="text-sm font-semibold text-brand">{notice}</p>}

      <div className="space-y-4">
        {WEEK_DAYS.map((day) => (
          <section key={day} className="surface p-4">
            <h2 className="display text-xl">{t(locale, dayLabels[day])}</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {meals.map((meal) => {
                const recipeId = weekPlan[day]?.[meal];
                const recipe = recipes.find((r) => r.id === recipeId);
                return (
                  <div
                    key={meal}
                    className="rounded-2xl border border-[var(--line)] bg-white/70 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      {t(locale, meal)}
                    </p>
                    <p className="mt-1 min-h-[2.5rem] text-sm font-semibold">
                      {recipe
                        ? recipeName(recipe, locale)
                        : "—"}
                    </p>
                    {recipe && (
                      <p className="text-xs text-brand">{recipe.perServing.kcal} kcal</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand"
                        onClick={() => setPicking({ day, meal })}
                      >
                        {t(locale, "pickRecipe")}
                      </button>
                      {recipeId && (
                        <button
                          type="button"
                          className="rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft"
                          onClick={() => setPlanSlot(day, meal, null)}
                        >
                          {t(locale, "clearSlot")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 md:place-items-center md:p-6">
          <div className="surface max-h-[80vh] w-full max-w-lg overflow-auto rounded-t-3xl p-5 md:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="display text-xl">
                {t(locale, dayLabels[picking.day])} · {t(locale, picking.meal)}
              </h3>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm"
                onClick={() => setPicking(null)}
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-left hover:border-brand/40"
                    onClick={() => {
                      setPlanSlot(picking.day, picking.meal, recipe.id);
                      setPicking(null);
                    }}
                  >
                    <span className="text-sm font-semibold">
                      {recipeName(recipe, locale)}
                    </span>
                    <span className="text-sm text-brand">
                      {recipe.perServing.kcal} kcal
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

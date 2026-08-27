"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, ShoppingCart, Sparkles, Wand2 } from "lucide-react";
import { recipeName, recipes } from "@/lib/recipes";
import { t, type TranslationKey } from "@/lib/i18n";
import { triggerHaptic } from "@/lib/haptics";
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
  const autoGenerateWeekPlan = useFarfurieStore((s) => s.autoGenerateWeekPlan);

  const [picking, setPicking] = useState<{ day: DayKey; meal: MealKey } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAutoGenerate = () => {
    triggerHaptic("success");
    autoGenerateWeekPlan();
    setFeedback(locale === "ro" ? "Plan pe 7 zile generat automat!" : "7-day plan auto-generated!");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleAddShopping = () => {
    triggerHaptic("medium");
    addWeekPlanToShopping();
    setFeedback(locale === "ro" ? "Ingrediente adăugate în lista de cumpărături!" : "Ingredients added to shopping list!");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleApplyToday = () => {
    triggerHaptic("light");
    applyTodayPlanToDiary();
    setFeedback(locale === "ro" ? "Mesele de azi au fost aplicate în jurnal!" : "Today's meals applied to diary!");
    setTimeout(() => setFeedback(null), 2500);
  };

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

      {/* Action Toolbar */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          className="btn btn-primary text-sm shadow-sm"
          onClick={handleAutoGenerate}
        >
          <Wand2 size={16} />
          {locale === "ro" ? "Generare Plan Automată (7 Zile)" : "Auto-Generate 7-Day Plan"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          className="btn btn-ghost text-sm"
          onClick={handleApplyToday}
        >
          <CalendarCheck size={16} />
          {t(locale, "applyToday")}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          className="btn btn-ghost text-sm"
          onClick={handleAddShopping}
        >
          <ShoppingCart size={16} />
          {t(locale, "planToList")}
        </motion.button>
      </div>

      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand"
        >
          <Sparkles size={14} />
          {feedback}
        </motion.p>
      )}

      {/* 7 Days Grid */}
      <div className="space-y-4">
        {WEEK_DAYS.map((day) => {
          const daySlots = weekPlan[day] ?? {};
          const dayKcal = Object.values(daySlots).reduce((acc, recipeId) => {
            const r = recipes.find((x) => x.id === recipeId);
            return acc + (r?.perServing.kcal ?? 0);
          }, 0);

          return (
            <section key={day} className="surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="display text-xl">{t(locale, dayLabels[day])}</h2>
                {dayKcal > 0 && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    Total: {dayKcal} kcal
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {meals.map((meal) => {
                  const recipeId = weekPlan[day]?.[meal];
                  const recipe = recipes.find((r) => r.id === recipeId);
                  return (
                    <div
                      key={meal}
                      className="rounded-2xl border border-[var(--line)] bg-white/70 p-3 shadow-xs"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        {t(locale, meal)}
                      </p>
                      <p className="mt-1 min-h-[2.5rem] text-sm font-semibold">
                        {recipe ? recipeName(recipe, locale) : "—"}
                      </p>
                      {recipe && (
                        <p className="text-xs font-semibold text-brand">
                          {recipe.perServing.kcal} kcal · P {recipe.perServing.protein}g
                        </p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
                          onClick={() => setPicking({ day, meal })}
                        >
                          {t(locale, "pickRecipe")}
                        </motion.button>
                        {recipeId && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className="rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft transition-colors hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setPlanSlot(day, meal, null)}
                          >
                            {t(locale, "clearSlot")}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Recipe Selector Modal */}
      {picking && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 md:place-items-center md:p-6">
          <div className="surface max-h-[80vh] w-full max-w-lg overflow-auto rounded-t-3xl p-5 md:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="display text-xl">
                {t(locale, dayLabels[picking.day])} · {t(locale, picking.meal)}
              </h3>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm font-semibold hover:bg-black/5"
                onClick={() => setPicking(null)}
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-3.5 py-3 text-left hover:border-brand/40"
                    onClick={() => {
                      triggerHaptic("light");
                      setPlanSlot(picking.day, picking.meal, recipe.id);
                      setPicking(null);
                    }}
                  >
                    <span className="text-sm font-semibold">
                      {recipeName(recipe, locale)}
                    </span>
                    <span className="text-sm font-semibold text-brand">
                      {recipe.perServing.kcal} kcal
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

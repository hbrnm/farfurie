"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { foodName, foodUnit, macrosForGrams, searchFoods } from "@/lib/foods";
import { fillTheGap } from "@/lib/fillGap";
import { t } from "@/lib/i18n";
import { useGapMeal, useRemaining, useTodayEntries } from "@/lib/selectors";
import { type MealKey, useFarfurieStore } from "@/lib/store";

const meals: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];

export function DiaryBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const entries = useTodayEntries();
  const remaining = useRemaining();
  const gapMeal = useGapMeal();
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addRecipeToMeal = useFarfurieStore((s) => s.addRecipeToMeal);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const removeEntry = useFarfurieStore((s) => s.removeEntry);
  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
  const [query, setQuery] = useState("");
  const [showGap, setShowGap] = useState(true);
  const [gramsById, setGramsById] = useState<Record<string, number>>({});

  const results = useMemo(() => searchFoods(query, locale), [query, locale]);
  const gap = useMemo(() => fillTheGap(remaining), [remaining]);

  return (
    <div className="space-y-5">
      {showGap && gap.length > 0 && (
        <section className="surface animate-rise overflow-hidden p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold text-brand">
                <Sparkles size={16} />
                {t(locale, "fillGap")}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{t(locale, "fillGapDesc")}</p>
              <p className="mt-1 text-xs font-semibold text-ink-soft">
                → {t(locale, gapMeal)}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-ink-soft hover:bg-white"
              onClick={() => setShowGap(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {gap.map((s) => (
              <button
                key={s.id}
                type="button"
                className="rounded-2xl border border-[var(--line)] bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/30"
                onClick={() => {
                  if (s.kind === "food" && s.foodId) {
                    addFoodToMeal(s.foodId, gapMeal, s.grams);
                  } else if (s.recipeId) {
                    addRecipeToMeal(s.recipeId, gapMeal);
                  } else {
                    addEntry({
                      meal: gapMeal,
                      nameRo: s.nameRo,
                      nameEn: s.nameEn,
                      macros: s.macros,
                    });
                  }
                }}
              >
                <p className="font-semibold">
                  {locale === "ro" ? s.nameRo : s.nameEn}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {locale === "ro" ? s.reasonRo : s.reasonEn}
                </p>
                <p className="mt-3 text-sm font-semibold text-brand">
                  {s.macros.kcal} kcal · P {s.macros.protein}g
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {meals.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal === meal);
          const mealKcal = mealEntries.reduce((a, e) => a + e.macros.kcal, 0);
          return (
            <section key={meal} className="surface p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="display text-xl">{t(locale, meal)}</h3>
                  <p className="text-xs text-ink-soft">{mealKcal} kcal</p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost !px-3 !py-2 text-sm"
                  onClick={() => {
                    setOpenMeal(meal);
                    setQuery("");
                    setGramsById({});
                  }}
                >
                  <Plus size={16} />
                  {t(locale, "add")}
                </button>
              </div>
              {mealEntries.length === 0 ? (
                <p className="rounded-2xl bg-white/50 px-3 py-4 text-sm text-ink-soft">
                  {t(locale, "emptyMeal")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {mealEntries.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {locale === "ro" ? e.nameRo : e.nameEn}
                          {e.grams ? (
                            <span className="ml-1 text-xs font-medium text-ink-soft">
                              · {e.grams}g
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {e.macros.kcal} kcal · P {e.macros.protein}g · C{" "}
                          {e.macros.carbs}g · F {e.macros.fat}g
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-ink-soft hover:bg-[var(--bg)]"
                        onClick={() => removeEntry(e.id)}
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {openMeal && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 md:place-items-center md:p-6">
          <div className="surface max-h-[85vh] w-full max-w-lg overflow-auto rounded-t-3xl p-5 md:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="display text-2xl">
                {t(locale, "addFood")} · {t(locale, openMeal)}
              </h3>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-white"
                onClick={() => setOpenMeal(null)}
              >
                <X size={18} />
              </button>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(locale, "searchFood")}
              className="mb-4 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none ring-brand focus:ring-2"
            />
            <ul className="space-y-2">
              {results.length === 0 && (
                <li className="text-sm text-ink-soft">{t(locale, "noResults")}</li>
              )}
              {results.map((food) => {
                const grams = gramsById[food.id] ?? food.defaultGrams;
                const preview = macrosForGrams(food, grams);
                return (
                  <li key={food.id}>
                    <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/80 px-3 py-3">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left hover:text-brand"
                        onClick={() => {
                          addFoodToMeal(food.id, openMeal, grams);
                          setOpenMeal(null);
                        }}
                      >
                        <p className="text-sm font-semibold">
                          {foodName(food, locale)}
                          {food.brand ? (
                            <span className="ml-2 text-xs font-medium text-ink-soft">
                              {food.brand}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {foodUnit(food, locale)} · {preview.kcal} kcal
                        </p>
                      </button>
                      <label className="shrink-0 text-right text-xs text-ink-soft">
                        {t(locale, "grams")}
                        <input
                          type="number"
                          min={10}
                          max={800}
                          value={grams}
                          onChange={(e) =>
                            setGramsById((prev) => ({
                              ...prev,
                              [food.id]: Number(e.target.value) || food.defaultGrams,
                            }))
                          }
                          className="mt-1 w-20 rounded-xl border border-[var(--line)] bg-white px-2 py-1 text-sm font-semibold text-ink"
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

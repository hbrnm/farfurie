"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  foodName,
  foods,
  macrosForGrams,
  searchFoods,
  type Food,
  type Macros,
} from "@/lib/foods";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

type Line = { food: Food; grams: number };

function sum(lines: Line[]): Macros {
  return lines.reduce(
    (acc, line) => {
      const m = macrosForGrams(line.food, line.grams);
      return {
        kcal: acc.kcal + m.kcal,
        protein: Math.round((acc.protein + m.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
        fat: Math.round((acc.fat + m.fat) * 10) / 10,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function BuilderBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const saveNamedMeal = useFarfurieStore((s) => s.saveNamedMeal);
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const results = useMemo(() => searchFoods(query, locale).slice(0, 8), [query, locale]);
  const totals = sum(lines);
  const perServing = {
    kcal: Math.round(totals.kcal / Math.max(servings, 1)),
    protein: Math.round((totals.protein / Math.max(servings, 1)) * 10) / 10,
    carbs: Math.round((totals.carbs / Math.max(servings, 1)) * 10) / 10,
    fat: Math.round((totals.fat / Math.max(servings, 1)) * 10) / 10,
  };

  const addLine = (food: Food) => {
    setLines((prev) => [...prev, { food, grams: food.defaultGrams }]);
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "builderTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "builderDesc")}</p>
      </header>

      <section className="surface p-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(locale, "addIngredient")}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none ring-brand focus:ring-2"
        />
        {query.trim() && (
          <ul className="mt-3 space-y-2">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-2 text-left text-sm font-semibold hover:border-brand/40"
                  onClick={() => addLine(food)}
                >
                  {foodName(food, locale)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lines.length === 0 ? (
        <p className="text-sm text-ink-soft">{t(locale, "builderEmpty")}</p>
      ) : (
        <section className="surface divide-y divide-[var(--line)] overflow-hidden">
          {lines.map((line, i) => {
            const m = macrosForGrams(line.food, line.grams);
            return (
              <div key={`${line.food.id}-${i}`} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{foodName(line.food, locale)}</p>
                  <p className="text-xs text-ink-soft">
                    {m.kcal} kcal · P {m.protein}g
                  </p>
                </div>
                <input
                  type="number"
                  min={10}
                  max={800}
                  value={line.grams}
                  onChange={(e) => {
                    const grams = Number(e.target.value);
                    setLines((prev) => prev.map((row, idx) => (idx === i ? { ...row, grams } : row)));
                  }}
                  className="w-20 rounded-xl border border-[var(--line)] bg-white px-2 py-1.5 text-sm"
                  aria-label={t(locale, "grams")}
                />
                <button
                  type="button"
                  className="rounded-full p-1 text-ink-soft"
                  onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </section>
      )}

      <section className="surface space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["kcal", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k} className="rounded-2xl bg-brand/5 p-3 text-center">
              <p className="text-xs font-semibold uppercase text-ink-soft">
                {k === "kcal" ? "kcal" : t(locale, k)}
              </p>
              <p className="display text-2xl text-brand">{perServing[k]}</p>
            </div>
          ))}
        </div>
        <label className="block text-sm font-semibold text-ink-soft">
          {t(locale, "servingsOut")}: {servings}
          <input
            type="range"
            min={1}
            max={8}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(locale, "mealName")}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary text-sm"
            disabled={lines.length === 0}
            onClick={() => {
              const label = name.trim() || (locale === "ro" ? "Rețetă proprie" : "Custom recipe");
              addEntry({
                meal: "lunch",
                nameRo: `${label} (${servings} ${locale === "ro" ? "porții" : "servings"})`,
                nameEn: `${label} (${servings} servings)`,
                macros: perServing,
              });
              if (name.trim()) {
                saveNamedMeal(name.trim(), [
                  {
                    meal: "lunch",
                    nameRo: label,
                    nameEn: label,
                    macros: perServing,
                  },
                ]);
              }
            }}
          >
            {t(locale, "saveRecipeMeal")}
          </button>
          <button type="button" className="btn btn-ghost text-sm" onClick={() => setLines([])}>
            {t(locale, "clearBuilder")}
          </button>
        </div>
        <p className="text-[11px] text-ink-soft">
          {foods.length} {locale === "ro" ? "alimente în catalog" : "foods in catalog"}
        </p>
      </section>
    </div>
  );
}

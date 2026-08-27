"use client";

import { useMemo, useState } from "react";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { type MealKey, useFarfurieStore } from "@/lib/store";
import { DiaryHeader } from "@/features/diary/components/DiaryHeader";
import { FillTheGapCard } from "@/features/diary/components/FillTheGapCard";
import { MealSection } from "@/features/diary/components/MealSection";
import { DiaryQuickActions } from "@/features/diary/components/DiaryQuickActions";
import { plateMacros, plateTemplates } from "@/lib/plates";
import { t } from "@/lib/i18n";

const meals: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];

export function DiaryBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const allEntries = useFarfurieStore((s) => s.entries);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);

  const entries = useMemo(
    () => allEntries.filter((e) => e.date === selectedDate),
    [allEntries, selectedDate],
  );

  return (
    <div className="space-y-5">
      <DiaryHeader />

      <DiaryQuickActions entries={entries} />

      <section className="surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {t(locale, "plateEstimate")}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {plateTemplates.map((plate) => {
            const macros = plateMacros(plate.items);
            return (
              <button
                key={plate.id}
                type="button"
                className="rounded-2xl border border-[var(--line)] bg-white/70 p-3 text-left hover:border-brand/40"
                onClick={() => {
                  plate.items.forEach((item) => addFoodToMeal(item.foodId, "lunch", item.grams));
                }}
              >
                <p className="font-semibold">{locale === "ro" ? plate.nameRo : plate.nameEn}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {locale === "ro" ? plate.reasonRo : plate.reasonEn}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand">
                  {t(locale, "addPlate")} · {macros.kcal} kcal · P {macros.protein}g
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <FillTheGapCard />

      <div className="grid gap-4 lg:grid-cols-2">
        {meals.map((meal) => (
          <MealSection
            key={meal}
            meal={meal}
            entries={entries}
            onOpenAddSheet={(m) => setOpenMeal(m)}
          />
        ))}
      </div>

      {openMeal && <AddFoodSheet meal={openMeal} onClose={() => setOpenMeal(null)} />}
    </div>
  );
}

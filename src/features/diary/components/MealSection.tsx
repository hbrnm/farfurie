"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CopyPlus, Plus, Utensils } from "lucide-react";
import { t } from "@/lib/i18n";
import { shiftISO } from "@/lib/dates";
import { triggerHaptic } from "@/lib/haptics";
import { type DiaryEntry, type MealKey, useFarfurieStore } from "@/lib/store";
import { DiaryEntryRow } from "./DiaryEntryRow";

type Props = {
  meal: MealKey;
  entries: DiaryEntry[];
  onOpenAddSheet: (meal: MealKey) => void;
};

const MEAL_ICONS: Record<MealKey, string> = {
  breakfast: "🍳",
  lunch: "🥘",
  dinner: "🍲",
  snack: "🍎",
};

export function MealSection({ meal, entries, onOpenAddSheet }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const copyMealToDate = useFarfurieStore((s) => s.copyMealToDate);
  const removeEntry = useFarfurieStore((s) => s.removeEntry);
  const [copiedMeal, setCopiedMeal] = useState<MealKey | null>(null);

  const mealEntries = entries.filter((e) => e.meal === meal);
  const mealKcal = Math.round(mealEntries.reduce((a, e) => a + e.macros.kcal, 0));
  const mealProtein = Math.round(mealEntries.reduce((a, e) => a + e.macros.protein, 0));
  const mealCarbs = Math.round(mealEntries.reduce((a, e) => a + e.macros.carbs, 0));
  const mealFat = Math.round(mealEntries.reduce((a, e) => a + e.macros.fat, 0));

  const handleCopyTomorrow = () => {
    triggerHaptic("light");
    const n = copyMealToDate(meal, shiftISO(selectedDate, 1));
    if (n > 0) {
      setCopiedMeal(meal);
      window.setTimeout(() => setCopiedMeal(null), 1800);
    }
  };

  const handleOpenAdd = () => {
    triggerHaptic("light");
    onOpenAddSheet(meal);
  };

  return (
    <section className="surface p-4 md:p-5 dark:bg-[#121214] dark:border-white/10 shadow-sm transition-all hover:shadow-md">
      {/* Header Masă */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{MEAL_ICONS[meal]}</span>
          <div>
            <h3 className="display text-lg font-extrabold text-gray-900 dark:text-white capitalize">
              {t(locale, meal)}
            </h3>
            <p className="text-xs font-mono font-medium text-gray-500 dark:text-zinc-400">
              <strong className="text-gray-900 dark:text-white font-bold">{mealKcal}</strong> kcal
              {mealEntries.length > 0 && (
                <span> · P {mealProtein}g · C {mealCarbs}g · F {mealFat}g</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-400 disabled:opacity-30 transition-colors"
            disabled={mealEntries.length === 0}
            title={t(locale, "copyTomorrow")}
            onClick={handleCopyTomorrow}
          >
            <CopyPlus size={16} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 dark:bg-[#55dc88]/15 px-3 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-[#55dc88] hover:bg-emerald-500/25 transition-all"
          >
            <Plus size={14} />
            <span>{t(locale, "add")}</span>
          </motion.button>
        </div>
      </div>

      {copiedMeal === meal && (
        <p className="mb-2 text-xs font-bold text-emerald-600 dark:text-[#55dc88]">
          {t(locale, "copiedTomorrow")}
        </p>
      )}

      {/* Lista de alimente logate */}
      {mealEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/30 p-4 text-center">
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            {t(locale, "emptyMeal")}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-[#55dc88] hover:underline"
          >
            <Plus size={12} />
            {t(locale, "add")} {t(locale, meal)}
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {mealEntries.map((e) => (
              <DiaryEntryRow key={e.id} entry={e} onRemove={removeEntry} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Buton jos de adăugare facilă la masă */}
      {mealEntries.length > 0 && (
        <button
          type="button"
          onClick={handleOpenAdd}
          className="mt-3 w-full rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 py-2 text-center text-xs font-bold text-gray-500 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-[#55dc88] transition-all"
        >
          + {locale === "ro" ? `Adaugă la ${t(locale, meal)}` : `Add to ${t(locale, meal)}`}
        </button>
      )}
    </section>
  );
}

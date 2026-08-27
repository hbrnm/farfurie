"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CopyPlus, Plus } from "lucide-react";
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

export function MealSection({ meal, entries, onOpenAddSheet }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const copyMealToDate = useFarfurieStore((s) => s.copyMealToDate);
  const removeEntry = useFarfurieStore((s) => s.removeEntry);
  const [copiedMeal, setCopiedMeal] = useState<MealKey | null>(null);

  const mealEntries = entries.filter((e) => e.meal === meal);
  const mealKcal = mealEntries.reduce((a, e) => a + e.macros.kcal, 0);

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
    <section className="surface p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="display text-xl">{t(locale, meal)}</h3>
          <p className="text-xs text-ink-soft">{mealKcal} kcal</p>
        </div>
        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="rounded-full p-2 text-ink-soft hover:bg-white disabled:opacity-30"
            disabled={mealEntries.length === 0}
            title={t(locale, "copyTomorrow")}
            onClick={handleCopyTomorrow}
          >
            <CopyPlus size={16} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn btn-ghost !px-3 !py-2 text-sm"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            {t(locale, "add")}
          </motion.button>
        </div>
      </div>
      {copiedMeal === meal && (
        <p className="mb-2 text-xs font-semibold text-brand">{t(locale, "copiedTomorrow")}</p>
      )}
      {mealEntries.length === 0 ? (
        <p className="rounded-2xl bg-white/50 px-3 py-4 text-sm text-ink-soft">
          {t(locale, "emptyMeal")}
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {mealEntries.map((e) => (
              <DiaryEntryRow key={e.id} entry={e} onRemove={removeEntry} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

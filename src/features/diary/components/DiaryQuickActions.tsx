"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Beer, FileText, Share2, Wine } from "lucide-react";
import { t } from "@/lib/i18n";
import { dayShareText } from "@/lib/share";
import { triggerHaptic } from "@/lib/haptics";
import { type DiaryEntry, useFarfurieStore } from "@/lib/store";
import { useBurnedToday, useEffectiveGoals, useTotals } from "@/lib/selectors";

type Props = {
  entries: DiaryEntry[];
};

export function DiaryQuickActions({ entries }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const dayNotes = useFarfurieStore((s) => s.dayNotes);
  const setDayNote = useFarfurieStore((s) => s.setDayNote);
  const waterByDate = useFarfurieStore((s) => s.waterByDate);

  const goals = useEffectiveGoals();
  const totals = useTotals();
  const burned = useBurnedToday();
  const waterMl = waterByDate[selectedDate] ?? 0;

  const [shareFeedback, setShareFeedback] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const currentNote = dayNotes[selectedDate] ?? "";

  const handleQuickLog = (foodId: "bere-blonda-500ml" | "vin-rosu-150ml") => {
    triggerHaptic("success");
    addFoodToMeal(foodId, "snack", foodId === "bere-blonda-500ml" ? 500 : 150);
  };

  const handleShare = async () => {
    triggerHaptic("light");
    const text = dayShareText({
      locale,
      date: selectedDate,
      entries,
      totals,
      goalKcal: goals.kcal,
      burned,
      waterMl,
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: "Farfurie", text });
      } catch {
        // user cancelled share sheet
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          className="btn btn-ghost text-sm"
          disabled={entries.length === 0}
          onClick={handleShare}
        >
          <Share2 size={16} />
          {t(locale, "shareDay")}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => handleQuickLog("bere-blonda-500ml")}
        >
          <Beer size={16} />
          {t(locale, "logBeer")}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => handleQuickLog("vin-rosu-150ml")}
        >
          <Wine size={16} />
          {t(locale, "logWine")}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => setNoteOpen(!noteOpen)}
        >
          <FileText size={16} />
          {t(locale, "dayNote")}
        </motion.button>
      </div>

      {shareFeedback && (
        <p className="text-xs font-semibold text-brand">{t(locale, "copiedShare")}</p>
      )}

      {noteOpen && (
        <div className="surface p-4 animate-rise">
          <textarea
            value={currentNote}
            onChange={(e) => setDayNote(selectedDate, e.target.value)}
            placeholder={t(locale, "dayNotePh")}
            className="w-full rounded-2xl border border-[var(--line)] bg-white/70 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            rows={3}
          />
        </div>
      )}
    </div>
  );
}

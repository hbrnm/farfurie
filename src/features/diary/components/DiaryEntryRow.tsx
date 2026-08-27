"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Utensils } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { type DiaryEntry, useFarfurieStore } from "@/lib/store";

type Props = {
  entry: DiaryEntry;
  onRemove: (id: string) => void;
};

export function DiaryEntryRow({ entry, onRemove }: Props) {
  const locale = useFarfurieStore((s) => s.locale);

  const handleRemove = () => {
    triggerHaptic("medium");
    onRemove(entry.id);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/90 p-3.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {/* Food Icon / Thumbnail (Mockup 2 style) */}
        <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold">
          <Utensils size={18} />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">
            {locale === "ro" ? entry.nameRo : entry.nameEn}
          </p>
          {/* Colorful Macro Badges (Mockup 2 Pill Badges) */}
          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-bold">
            <span className="text-orange-600 font-bold">{entry.macros.protein}P</span>
            <span className="text-amber-600 font-bold">{entry.macros.carbs}C</span>
            <span className="text-blue-600 font-bold">{entry.macros.fat}F</span>
            {entry.grams && <span className="text-gray-400">· {entry.grams}g</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-extrabold text-emerald-700">
          {entry.macros.kcal} kcal
        </span>

        <motion.button
          whileTap={{ scale: 0.85 }}
          type="button"
          className="rounded-xl bg-gray-100 p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          onClick={handleRemove}
          aria-label="Remove entry"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.li>
  );
}

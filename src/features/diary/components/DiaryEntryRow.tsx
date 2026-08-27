"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
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
      className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div>
        <p className="text-sm font-semibold">
          {locale === "ro" ? entry.nameRo : entry.nameEn}
        </p>
        <p className="text-xs text-ink-soft">
          {entry.macros.kcal} kcal · P {entry.macros.protein}g · C {entry.macros.carbs}g · F {entry.macros.fat}g
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        type="button"
        className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-rose-50 hover:text-rose-600"
        onClick={handleRemove}
        aria-label="Remove"
      >
        <X size={14} />
      </motion.button>
    </motion.li>
  );
}

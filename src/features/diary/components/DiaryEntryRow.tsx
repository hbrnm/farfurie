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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm dark:bg-[#1c1c1f] dark:border-zinc-800"
    >
      <div className="flex items-center gap-2 truncate">
        <span className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
          {locale === "ro" ? entry.nameRo : entry.nameEn}
        </span>
        {entry.grams && (
          <span className="text-xs text-gray-500 dark:text-zinc-400 font-normal">({entry.grams}g)</span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono text-xs">
          {entry.macros.kcal} kcal
        </span>

        <button
          type="button"
          className="rounded-lg p-1 text-gray-400 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          onClick={handleRemove}
          aria-label="Remove"
        >
          <X size={16} />
        </button>
      </div>
    </motion.li>
  );
}

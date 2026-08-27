"use client";

import { X } from "lucide-react";
import { type DiaryEntry, useFarfurieStore } from "@/lib/store";

type Props = {
  entry: DiaryEntry;
  onRemove: (id: string) => void;
};

export function DiaryEntryRow({ entry, onRemove }: Props) {
  const locale = useFarfurieStore((s) => s.locale);

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5">
      <div>
        <p className="text-sm font-semibold">
          {locale === "ro" ? entry.nameRo : entry.nameEn}
        </p>
        <p className="text-xs text-ink-soft">
          {entry.macros.kcal} kcal · P {entry.macros.protein}g · C {entry.macros.carbs}g · F {entry.macros.fat}g
        </p>
      </div>
      <button
        type="button"
        className="rounded-full p-1.5 text-ink-soft hover:bg-[var(--bg)]"
        onClick={() => onRemove(entry.id)}
        aria-label="Remove"
      >
        <X size={14} />
      </button>
    </li>
  );
}

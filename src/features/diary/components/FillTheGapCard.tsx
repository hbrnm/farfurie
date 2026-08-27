"use client";

import { useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { fillTheGap } from "@/lib/fillGap";
import { useFarfurieStore } from "@/lib/store";
import { useRemaining } from "@/lib/selectors";

export function FillTheGapCard() {
  const locale = useFarfurieStore((s) => s.locale);
  const remaining = useRemaining();
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addRecipeToMeal = useFarfurieStore((s) => s.addRecipeToMeal);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const [showGap, setShowGap] = useState(true);

  const gap = useMemo(() => fillTheGap(remaining), [remaining]);

  if (!showGap || gap.length === 0) return null;

  return (
    <section className="surface animate-rise overflow-hidden p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-brand">
            <Sparkles size={16} />
            {t(locale, "fillGap")}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "fillGapDesc")}</p>
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
                addFoodToMeal(s.foodId, "dinner", s.grams);
              } else if (s.recipeId) {
                addRecipeToMeal(s.recipeId, "dinner");
              } else {
                addEntry({
                  meal: "dinner",
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
  );
}

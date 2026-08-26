"use client";

import { Droplets, Flame } from "lucide-react";
import { t } from "@/lib/i18n";
import { useEffectiveGoals, useFarfurieStore } from "@/lib/store";

export function SideStats() {
  const locale = useFarfurieStore((s) => s.locale);
  const waterMl = useFarfurieStore((s) => s.waterForSelected());
  const streak = useFarfurieStore((s) => s.currentStreak());
  const addWater = useFarfurieStore((s) => s.addWater);
  const goals = useEffectiveGoals();
  const waterPct = Math.min(100, Math.round((waterMl / goals.waterMl) * 100));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <section className="surface p-5">
        <div className="mb-3 flex items-center gap-2 text-brand">
          <Droplets size={18} />
          <h3 className="font-semibold">{t(locale, "water")}</h3>
        </div>
        <p className="display text-3xl">
          {waterMl}
          <span className="text-base font-sans text-ink-soft"> / {goals.waterMl} ml</span>
        </p>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: `${waterPct}%` }} />
        </div>
        <button type="button" className="btn btn-ghost mt-4 w-full text-sm" onClick={addWater}>
          {t(locale, "logWater")}
        </button>
      </section>

      <section className="surface p-5">
        <div className="mb-3 flex items-center gap-2 text-accent">
          <Flame size={18} />
          <h3 className="font-semibold">{t(locale, "streak")}</h3>
        </div>
        <p className="display text-3xl">{streak}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {locale === "ro"
            ? "Continuitatea bate perfecțiunea — mai ales după weekend."
            : "Consistency beats perfection — especially after weekends."}
        </p>
      </section>
    </div>
  );
}

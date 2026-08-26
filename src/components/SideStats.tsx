"use client";

import { Droplets, Flame, Timer } from "lucide-react";
import { t } from "@/lib/i18n";
import { foods } from "@/lib/foods";
import { useEffectiveGoals, useFastingStatus, useTotals } from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";

const DRINK_IDS = new Set(foods.filter((f) => f.category === "drink").map((f) => f.id));

function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function SideStats() {
  const locale = useFarfurieStore((s) => s.locale);
  const waterMl = useFarfurieStore((s) => s.waterForSelected());
  const streak = useFarfurieStore((s) => s.currentStreak());
  const addWater = useFarfurieStore((s) => s.addWater);
  const goals = useEffectiveGoals();
  const totals = useTotals();
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const entries = useFarfurieStore((s) => s.entries);
  const status = useFastingStatus();
  const waterPct = Math.min(100, Math.round((waterMl / goals.waterMl) * 100));
  const drinkKcal = entries
    .filter((e) => e.date === selectedDate && e.foodId && DRINK_IDS.has(e.foodId))
    .reduce((a, e) => a + e.macros.kcal, 0);

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
        {drinkKcal > 0 && (
          <p className="mt-3 text-sm font-semibold text-[var(--danger)]">
            {t(locale, "alcoholWeek").split("—")[0].trim()}: {drinkKcal} kcal · {totals.kcal}{" "}
            {t(locale, "calories")}
          </p>
        )}
      </section>

      {status.active && (
        <section className="surface p-5">
          <div className="mb-2 flex items-center gap-2 text-brand">
            <Timer size={18} />
            <h3 className="font-semibold">{t(locale, "fasting")}</h3>
          </div>
          <p className="text-sm text-ink-soft">
            {status.phase === "fasting" ? t(locale, "fastingNow") : t(locale, "eatingNow")}
          </p>
          <p className="display mt-1 text-2xl text-brand">
            {t(locale, "fastingLeft")} {formatMins(status.remainingMin)}
          </p>
        </section>
      )}
    </div>
  );
}

"use client";

import { useShallow } from "zustand/react/shallow";
import { t } from "@/lib/i18n";
import { localISO } from "@/lib/dates";
import { useEffectiveGoals, useFarfurieStore } from "@/lib/store";

export function InsightsPanel() {
  const locale = useFarfurieStore((s) => s.locale);
  const today = localISO();
  const totals = useFarfurieStore(useShallow((s) => s.totalsFor(today)));
  const goals = useEffectiveGoals();
  const streak = useFarfurieStore((s) => s.currentStreak());
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const mealsLogged = useFarfurieStore(
    (s) => s.entries.filter((e) => e.date === today).length,
  );
  const profile = useFarfurieStore((s) => s.profile);
  const burned = useFarfurieStore((s) => s.burnedOn(today));
  const week = useFarfurieStore(useShallow((s) => s.weekKcal()));

  const proteinPct = Math.round((totals.protein / Math.max(goals.protein, 1)) * 100);
  const goalLabel = t(locale, profile.goal);
  const labels =
    locale === "ro"
      ? ["L", "Ma", "Mi", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];
  const weekMax = Math.max(goals.kcal, ...week, 1);

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "navInsights")}</h1>
        <p className="mt-2 text-ink-soft">
          {locale === "ro"
            ? "O privire clară asupra zilei — fără zgomot inutil."
            : "A clear view of today — without the noise."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "demoProfile")}</p>
          <p className="display mt-1 text-2xl">{goalLabel}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {goals.kcal} kcal · {goals.protein}g {t(locale, "protein").toLowerCase()}
          </p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "streak")}</p>
          <p className="display mt-1 text-2xl">{streak}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "burned")}</p>
          <p className="display mt-1 text-2xl">{burned}</p>
          <p className="mt-2 text-sm text-ink-soft">kcal</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "protein")}</p>
          <p className="display mt-1 text-2xl">{proteinPct}%</p>
          <p className="mt-2 text-sm text-ink-soft">
            {totals.protein}g / {goals.protein}g
          </p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "mealsLogged")}</p>
          <p className="display mt-1 text-2xl">{mealsLogged}</p>
        </article>
      </div>

      <section className="surface p-5">
        <h2 className="display mb-4 text-2xl">{t(locale, "weekCalories")}</h2>
        <div className="flex h-40 items-end gap-2">
          {week.map((v, i) => {
            const h = v === 0 ? 8 : Math.max(12, Math.round((v / weekMax) * 100));
            return (
              <div key={labels[i]} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-brand to-accent transition-all"
                  style={{
                    height: `${h}%`,
                    minHeight: v ? undefined : 8,
                    opacity: v ? 1 : 0.25,
                  }}
                />
                <span className="text-xs font-semibold text-ink-soft">{labels[i]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {holidayMode && (
        <section className="surface border-accent/40 p-5">
          <h2 className="display text-2xl">{t(locale, "holidays")}</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {locale === "ro"
              ? "Bugetul e +15%. După sărbători: 2 zile cu proteine ridicate, plimbare 30 min, fără restricții extreme."
              : "Budget is +15%. After holidays: 2 higher-protein days, 30 min walk, no extreme restriction."}
          </p>
        </section>
      )}
    </div>
  );
}

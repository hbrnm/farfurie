"use client";

import { t } from "@/lib/i18n";
import { weekdayShort } from "@/lib/dates";
import {
  useBurnedToday,
  useEffectiveGoals,
  useStreak,
  useTodayEntries,
  useTotals,
  useWeekKcal,
} from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";

export function InsightsPanel() {
  const locale = useFarfurieStore((s) => s.locale);
  const totals = useTotals();
  const goals = useEffectiveGoals();
  const streak = useStreak();
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const entries = useTodayEntries();
  const profile = useFarfurieStore((s) => s.profile);
  const burned = useBurnedToday();
  const week = useWeekKcal();

  const proteinPct = Math.round((totals.protein / Math.max(goals.protein, 1)) * 100);
  const goalLabel = t(locale, profile.goal);
  const maxKcal = Math.max(goals.kcal, ...week.map((d) => d.kcal), 1);

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
          <p className="text-sm text-ink-soft">{t(locale, "mealsToday")}</p>
          <p className="display mt-1 text-2xl">{entries.length}</p>
        </article>
      </div>

      <section className="surface p-5">
        <h2 className="display mb-4 text-2xl">{t(locale, "weekCalories")}</h2>
        <div className="flex h-40 items-end gap-2">
          {week.map((day) => {
            const h = day.kcal === 0 ? 8 : Math.max(12, Math.round((day.kcal / maxKcal) * 100));
            return (
              <div key={day.dateKey} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-brand to-accent transition-all"
                  style={{
                    height: `${h}%`,
                    minHeight: day.kcal ? undefined : 8,
                    opacity: day.kcal ? 1 : 0.25,
                  }}
                />
                <span className="text-xs font-semibold text-ink-soft">
                  {weekdayShort(day.dateKey, locale)}
                </span>
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

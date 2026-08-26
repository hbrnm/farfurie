"use client";

import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function InsightsPanel() {
  const locale = useFarfurieStore((s) => s.locale);
  const totals = useFarfurieStore((s) => s.totals());
  const goals = useFarfurieStore((s) => s.effectiveGoals());
  const streak = useFarfurieStore((s) => s.streak);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const entries = useFarfurieStore((s) => s.entries);

  const proteinPct = Math.round((totals.protein / goals.protein) * 100);
  const week = [1800, 2050, 1920, 2210, totals.kcal, 0, 0];

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
          <p className="display mt-1 text-2xl">{t(locale, "weightGoal")}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {goals.kcal} kcal · {goals.protein}g {t(locale, "protein").toLowerCase()}
          </p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "streak")}</p>
          <p className="display mt-1 text-2xl">{streak}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "protein")}</p>
          <p className="display mt-1 text-2xl">{proteinPct}%</p>
          <p className="mt-2 text-sm text-ink-soft">
            {totals.protein}g / {goals.protein}g
          </p>
        </article>
      </div>

      <section className="surface p-5">
        <h2 className="display mb-4 text-2xl">
          {locale === "ro" ? "Calorii — săptămâna asta" : "Calories — this week"}
        </h2>
        <div className="flex h-40 items-end gap-2">
          {week.map((v, i) => {
            const h = v === 0 ? 8 : Math.max(12, Math.round((v / 2600) * 100));
            const labels = locale === "ro"
              ? ["L", "Ma", "Mi", "J", "V", "S", "D"]
              : ["M", "T", "W", "T", "F", "S", "S"];
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-brand to-accent transition-all"
                  style={{ height: `${h}%`, minHeight: v ? undefined : 8, opacity: v ? 1 : 0.25 }}
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

      <section className="surface p-5">
        <h2 className="display mb-3 text-2xl">
          {locale === "ro" ? "Mese logate azi" : "Meals logged today"}
        </h2>
        <p className="text-sm text-ink-soft">
          {entries.length}{" "}
          {locale === "ro" ? "intrări în jurnal" : "diary entries"}
        </p>
      </section>
    </div>
  );
}

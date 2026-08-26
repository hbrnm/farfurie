"use client";

import { t } from "@/lib/i18n";
import { isWeekendISO, lastNDates, localISO, weekISODates } from "@/lib/dates";
import { foods } from "@/lib/foods";
import { nutritionistCsv } from "@/lib/share";
import {
  useBurnedToday,
  useCurrentStreak,
  useEffectiveGoals,
  useTotals,
  useWeekKcal,
} from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";

const DRINK_IDS = new Set(foods.filter((f) => f.category === "drink").map((f) => f.id));

export function InsightsPanel() {
  const locale = useFarfurieStore((s) => s.locale);
  const today = localISO();
  const totals = useTotals(today);
  const goals = useEffectiveGoals();
  const streak = useCurrentStreak();
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const mealsLogged = useFarfurieStore(
    (s) => s.entries.filter((e) => e.date === today).length,
  );
  const profile = useFarfurieStore((s) => s.profile);
  const burned = useBurnedToday(today);
  const week = useWeekKcal();
  const entries = useFarfurieStore((s) => s.entries);
  const weightLogs = useFarfurieStore((s) => s.weightLogs);
  const targetWeightKg = useFarfurieStore((s) => s.targetWeightKg);
  const recovery = useFarfurieStore((s) => s.isRecovery());
  const startRecovery = useFarfurieStore((s) => s.startRecovery);
  const stopRecovery = useFarfurieStore((s) => s.stopRecovery);
  const exercises = useFarfurieStore((s) => s.exerciseLogs);

  const proteinPct = Math.round((totals.protein / Math.max(goals.protein, 1)) * 100);
  const goalLabel = t(locale, profile.goal);
  const labels =
    locale === "ro"
      ? ["L", "Ma", "Mi", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];
  const weekMax = Math.max(goals.kcal, ...week, 1);
  const heat = lastNDates(28);
  const kcalByDate = new Map<string, number>();
  entries.forEach((e) => {
    kcalByDate.set(e.date, (kcalByDate.get(e.date) ?? 0) + e.macros.kcal);
  });

  const weekDates = weekISODates(today);
  const weekdayVals = weekDates.filter((d) => !isWeekendISO(d)).map((d) => kcalByDate.get(d) ?? 0);
  const weekendVals = weekDates.filter((d) => isWeekendISO(d)).map((d) => kcalByDate.get(d) ?? 0);
  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;

  const alcoholWeek = entries
    .filter((e) => e.date >= weekDates[0] && e.foodId && DRINK_IDS.has(e.foodId))
    .reduce((a, e) => a + e.macros.kcal, 0);

  const latestWeight = weightLogs[weightLogs.length - 1]?.kg ?? profile.weightKg;
  const weightMax = Math.max(...weightLogs.map((w) => w.kg), latestWeight, 1);
  const weightMin = Math.min(...weightLogs.map((w) => w.kg), latestWeight);
  const span = Math.max(weightMax - weightMin, 1);
  const bmi = Math.round((latestWeight / (profile.heightCm / 100) ** 2) * 10) / 10;
  const kgToGo = Math.round((latestWeight - targetWeightKg) * 10) / 10;

  const download = () => {
    const csv = nutritionistCsv({ entries, exercises, days: 14 });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `farfurie-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <div key={`${labels[i]}-${i}`} className="flex flex-1 flex-col items-center gap-2">
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

      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "weekdayAvg")}</p>
          <p className="display mt-1 text-2xl">{avg(weekdayVals)}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "weekendAvg")}</p>
          <p className="display mt-1 text-2xl">{avg(weekendVals)}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-ink-soft">{t(locale, "alcoholWeek")}</p>
          <p className="display mt-1 text-2xl">{alcoholWeek}</p>
          <p className="mt-1 text-xs text-ink-soft">kcal</p>
        </article>
      </div>

      <section className="surface p-5">
        <h2 className="display mb-4 text-2xl">{t(locale, "heatmap")}</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {heat.map((iso) => {
            const kcal = kcalByDate.get(iso) ?? 0;
            const ratio = kcal / Math.max(goals.kcal, 1);
            const opacity = kcal === 0 ? 0.15 : Math.min(1, 0.25 + ratio * 0.75);
            return (
              <div
                key={iso}
                title={`${iso} · ${kcal} kcal`}
                className="aspect-square rounded-md bg-brand"
                style={{ opacity }}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-soft">28 {locale === "ro" ? "zile" : "days"}</p>
      </section>

      <section className="surface p-5">
        <h2 className="display mb-1 text-2xl">{t(locale, "weightTrend")}</h2>
        <p className="text-sm text-ink-soft">
          {latestWeight} kg · {t(locale, "bmi")} {bmi} · {kgToGo > 0 ? kgToGo : Math.abs(kgToGo)}{" "}
          {t(locale, "kgToGo")}
        </p>
        <div className="mt-4 flex h-28 items-end gap-1">
          {weightLogs.map((w) => {
            const h = 12 + ((w.kg - weightMin) / span) * 80;
            return (
              <div key={w.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-accent" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-ink-soft">{w.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="display text-2xl">{t(locale, "exportTitle")}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t(locale, "exportDesc")}</p>
        <button type="button" className="btn btn-primary mt-4 text-sm" onClick={download}>
          {t(locale, "downloadCsv")}
        </button>
      </section>

      <section className="surface border-accent/40 p-5">
        <h2 className="display text-2xl">{t(locale, "recovery")}</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {recovery ? t(locale, "recoveryOn") : t(locale, "featureRecoveryText")}
        </p>
        {recovery ? (
          <button type="button" className="btn btn-ghost mt-4 text-sm" onClick={stopRecovery}>
            {t(locale, "recoveryStop")}
          </button>
        ) : (
          <button type="button" className="btn btn-primary mt-4 text-sm" onClick={startRecovery}>
            {t(locale, "recoveryStart")}
          </button>
        )}
        {holidayMode && (
          <p className="mt-3 text-xs text-ink-soft">{t(locale, "holidaysOn")}</p>
        )}
      </section>
    </div>
  );
}

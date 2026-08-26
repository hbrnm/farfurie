"use client";

import { useState } from "react";
import { WeightTrendChart } from "@/components/WeightTrendChart";
import { t } from "@/lib/i18n";
import { checkInDue } from "@/lib/metabolism";
import { localISO } from "@/lib/dates";
import { WEEKLY_RATE_OPTIONS, type DietStyle, type ProgramMode } from "@/lib/goals";
import { useMetabolism } from "@/lib/selectors";
import { WEEK_DAYS, useFarfurieStore, type DayKey } from "@/lib/store";

const STYLES: DietStyle[] = ["balanced", "highProtein", "lowCarb", "keto"];
const MODES: ProgramMode[] = ["coached", "manual"];

export function MetabolismBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const report = useMetabolism();
  const applyWeeklyCheckIn = useFarfurieStore((s) => s.applyWeeklyCheckIn);
  const lastCheckInAt = useFarfurieStore((s) => s.lastCheckInAt);
  const programMode = useFarfurieStore((s) => s.programMode);
  const setProgramMode = useFarfurieStore((s) => s.setProgramMode);
  const dietStyle = useFarfurieStore((s) => s.dietStyle);
  const setDietStyle = useFarfurieStore((s) => s.setDietStyle);
  const weeklyRatePct = useFarfurieStore((s) => s.weeklyRatePct);
  const setWeeklyRatePct = useFarfurieStore((s) => s.setWeeklyRatePct);
  const trainingDays = useFarfurieStore((s) => s.trainingDays);
  const toggleTrainingDay = useFarfurieStore((s) => s.toggleTrainingDay);
  const goals = useFarfurieStore((s) => s.goals);
  const [applied, setApplied] = useState(false);
  const due = checkInDue(lastCheckInAt, localISO());
  const burn = report.expenditure ?? report.formulaTdee;
  const dayLabels =
    locale === "ro"
      ? { mon: "L", tue: "Ma", wed: "Mi", thu: "J", fri: "V", sat: "S", sun: "D" }
      : { mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S" };

  return (
    <div className="space-y-5">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "programTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "programDesc")}</p>
      </header>

      <section className="surface grid gap-4 p-5 md:grid-cols-3">
        <article>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {t(locale, "expenditure")}
          </p>
          <p className="display mt-1 text-4xl text-brand">{burn}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {report.expenditureSource === "data" ? t(locale, "fromData") : t(locale, "fromFormula")}
          </p>
        </article>
        <article>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {t(locale, "trendWeight")}
          </p>
          <p className="display mt-1 text-4xl">
            {report.trendNow != null ? report.trendNow.toFixed(1) : "—"}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {t(locale, "scaleWeight")}{" "}
            {report.scaleNow != null ? `${report.scaleNow.toFixed(1)} kg` : "—"}
          </p>
        </article>
        <article>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {t(locale, "goalEta")}
          </p>
          <p className="display mt-1 text-4xl">
            {report.etaWeeks != null ? report.etaWeeks : "—"}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {report.etaWeeks != null ? t(locale, "weeksToGoal") : t(locale, "etaNeedTrend")}
          </p>
        </article>
      </section>

      <section className="surface p-5">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="display text-2xl">{t(locale, "weightTrend")}</h2>
            <p className="text-sm text-ink-soft">
              {report.weeklyKg != null
                ? `${report.weeklyKg > 0 ? "+" : ""}${report.weeklyKg} kg / ${locale === "ro" ? "săpt" : "wk"}`
                : t(locale, "trendNeedData")}
            </p>
          </div>
          <p className="text-xs text-ink-soft">
            {t(locale, "loggedDays")}: {report.loggedDays} · {t(locale, "weighIns")}: {report.weighIns}
          </p>
        </div>
        <WeightTrendChart series={report.series} />
        <p className="mt-2 text-sm text-ink-soft">
          {locale === "ro" ? report.noteRo : report.noteEn}
        </p>
      </section>

      <section className="surface space-y-4 p-5">
        <h2 className="display text-2xl">{t(locale, "weeklyCheckIn")}</h2>
        <p className="text-sm text-ink-soft">{t(locale, "checkInDesc")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase text-ink-soft">{t(locale, "currentPlan")}</p>
            <p className="display mt-1 text-2xl">{goals.kcal} kcal</p>
            <p className="text-xs text-ink-soft">
              P {goals.protein}g · C {goals.carbs}g · F {goals.fat}g
            </p>
          </article>
          <article className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
            <p className="text-xs font-semibold uppercase text-ink-soft">{t(locale, "suggestedPlan")}</p>
            <p className="display mt-1 text-2xl text-brand">{report.suggestedKcal} kcal</p>
            <p className="text-xs text-ink-soft">
              P {report.suggested.protein}g · C {report.suggested.carbs}g · F {report.suggested.fat}g
            </p>
          </article>
        </div>
        <button
          type="button"
          className="btn btn-primary text-sm"
          onClick={() => {
            applyWeeklyCheckIn();
            setApplied(true);
          }}
        >
          {due ? t(locale, "applyCheckIn") : t(locale, "reapplyCheckIn")}
        </button>
        {applied && <p className="text-sm font-semibold text-brand">{t(locale, "checkInApplied")}</p>}
      </section>

      <section className="surface space-y-4 p-5">
        <h2 className="display text-2xl">{t(locale, "programSettings")}</h2>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-ink-soft">{t(locale, "programMode")}</p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  programMode === mode ? "bg-brand text-white" : "border border-[var(--line)] bg-white/80"
                }`}
                onClick={() => setProgramMode(mode)}
              >
                {t(locale, mode === "coached" ? "modeCoached" : "modeManual")}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-ink-soft">{t(locale, "dietStyle")}</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((style) => (
              <button
                key={style}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  dietStyle === style ? "bg-brand text-white" : "border border-[var(--line)] bg-white/80"
                }`}
                onClick={() => setDietStyle(style)}
              >
                {t(locale, `style_${style}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-ink-soft">{t(locale, "weeklyRate")}</p>
          <div className="flex flex-wrap gap-2">
            {WEEKLY_RATE_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  weeklyRatePct === pct ? "bg-brand text-white" : "border border-[var(--line)] bg-white/80"
                }`}
                onClick={() => setWeeklyRatePct(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-ink-soft">{t(locale, "trainingDays")}</p>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day: DayKey) => (
              <button
                key={day}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  trainingDays.includes(day) ? "bg-brand text-white" : "border border-[var(--line)] bg-white/80"
                }`}
                onClick={() => toggleTrainingDay(day)}
              >
                {dayLabels[day]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">{t(locale, "trainingDaysHint")}</p>
        </div>
      </section>
    </div>
  );
}

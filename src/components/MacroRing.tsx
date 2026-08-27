"use client";

import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { localISO } from "@/lib/dates";
import { useFarfurieStore } from "@/lib/store";
import {
  useBurnedToday,
  useEffectiveGoals,
  useRemaining,
  useTotals,
  useWeekBudget,
} from "@/lib/selectors";

export function MacroRing() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const goals = useEffectiveGoals();
  const totals = useTotals();
  const remaining = useRemaining();
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const burned = useBurnedToday();
  const week = useWeekBudget();
  const remainingLabel =
    selectedDate === localISO() ? t(locale, "remaining") : t(locale, "remainingDay");

  const budget = goals.kcal;
  const pct = Math.min(100, Math.round((totals.kcal / Math.max(budget, 1)) * 100));
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const macros = [
    { key: "protein" as const, value: totals.protein, goal: goals.protein, color: "#1b5e45" },
    { key: "carbs" as const, value: totals.carbs, goal: goals.carbs, color: "#e8a838" },
    { key: "fat" as const, value: totals.fat, goal: goals.fat, color: "#c45c3e" },
  ];

  return (
    <section className="surface animate-rise overflow-hidden p-5 md:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative mx-auto grid h-40 w-40 place-items-center md:mx-0">
          <svg className="-rotate-90" width="160" height="160" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="rgba(20,32,26,0.08)"
              strokeWidth="12"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1b5e45" />
                <stop offset="100%" stopColor="#e8a838" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {remaining.kcal >= 0 ? remainingLabel : t(locale, "overPlan")}
              </p>
              <motion.p
                key={remaining.kcal}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="display text-3xl text-brand"
              >
                {Math.abs(Math.round(remaining.kcal))}
              </motion.p>
              <p className="text-xs text-ink-soft">{t(locale, "calories")}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-ink-soft">
                {t(locale, "loggedVsPlan")} · {totals.kcal} / {budget} kcal
                {remaining.kcal < 0 ? ` · ${Math.abs(Math.round(remaining.kcal))} ${t(locale, "overPlan")}` : ""}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {t(locale, "weekBank")} {week.weeklyEaten} / {week.weeklyTarget} · {week.daysLeft}{" "}
                {t(locale, "daysLeftWeek")}
                {week.adjusted ? ` · ${t(locale, "weekAdjusted")}` : ""}
              </p>
              {burned > 0 && (
                <p className="mt-1 text-xs text-ink-soft">
                  {t(locale, "burned")} {burned} kcal · {t(locale, "noEatBack")}
                </p>
              )}
              {holidayMode && (
                <p className="mt-1 text-xs font-semibold text-[var(--danger)]">
                  {t(locale, "holidaysOn")}
                </p>
              )}
            </div>
            <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand">
              {pct}%
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {macros.map((m) => {
              const width = Math.min(100, Math.round((m.value / m.goal) * 100));
              return (
                <div key={m.key}>
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span>{t(locale, m.key)}</span>
                    <span className="text-ink-soft">
                      {m.value}/{m.goal}g
                    </span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 15 }}
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

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
  const profile = useFarfurieStore((s) => s.profile);
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
  const radius = 58;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const macros = [
    {
      key: "protein" as const,
      label: locale === "ro" ? "Proteine" : "Protein",
      value: totals.protein,
      goal: goals.protein,
      color: "#f97316", // Vibrant Orange/Red
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      dotColor: "bg-orange-500",
    },
    {
      key: "carbs" as const,
      label: locale === "ro" ? "Carbohidrați" : "Carbs",
      value: totals.carbs,
      goal: goals.carbs,
      color: "#eab308", // Amber/Yellow
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      dotColor: "bg-amber-500",
    },
    {
      key: "fat" as const,
      label: locale === "ro" ? "Grăsimi" : "Fat",
      value: totals.fat,
      goal: goals.fat,
      color: "#3b82f6", // Blue
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      dotColor: "bg-blue-500",
    },
  ];

  return (
    <section className="surface animate-rise overflow-hidden p-5 md:p-6 shadow-xl">
      {/* Top Greeting Header (Inspired by Mockup 2) */}
      <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            {new Date().toLocaleDateString(locale === "ro" ? "ro-RO" : "en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h2 className="display text-xl font-bold text-gray-900">
            {locale === "ro" ? "Bună ziua" : "Hello"}
          </h2>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/10 font-bold text-emerald-700">
          F
        </div>
      </div>

      {/* Main Ring & Quick Stats Grid (Mockup 2 Layout) */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Circular Ring Gauge */}
        <div className="relative mx-auto grid h-44 w-44 place-items-center md:mx-0">
          <svg className="-rotate-90" width="176" height="176" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="rgba(34,197,94,0.12)"
              strokeWidth="11"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#neonRingGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="neonRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <motion.p
                key={remaining.kcal}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="display text-4xl font-extrabold text-emerald-600 leading-none"
              >
                {Math.abs(Math.round(remaining.kcal))}
              </motion.p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                {remaining.kcal >= 0 ? "KCAL RĂMASE" : "PESTĂ PLAN"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Eaten / Burned / Fibre Breakdown */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-3.5 text-center">
            <div>
              <p className="text-[11px] font-semibold text-ink-soft">Consumat</p>
              <p className="display text-lg font-bold text-gray-900">{totals.kcal}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-ink-soft">Ars (Sport)</p>
              <p className="display text-lg font-bold text-emerald-600">{burned}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-ink-soft">Fibre</p>
              <p className="display text-lg font-bold text-amber-600">
                {Math.round(totals.carbs * 0.15)}g
              </p>
            </div>
          </div>

          {/* Bottom 3 Color-Coded Macro Badges (Mockup 2 Bottom Cards) */}
          <div className="grid gap-2.5 sm:grid-cols-3">
            {macros.map((m) => {
              const width = Math.min(100, Math.round((m.value / m.goal) * 100));
              return (
                <div
                  key={m.key}
                  className={`rounded-2xl border ${m.borderColor} ${m.bgColor} p-3 transition-colors`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <span className={`h-2 w-2 rounded-full ${m.dotColor}`} />
                      {m.label}
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {Math.round(m.value)} / {m.goal}g
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/10">
                    <motion.div
                      className="h-full rounded-full"
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

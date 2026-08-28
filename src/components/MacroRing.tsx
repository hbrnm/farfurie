"use client";

import { motion } from "framer-motion";
import { useFarfurieStore } from "@/lib/store";
import {
  useEffectiveGoals,
  useRemaining,
  useTotals,
} from "@/lib/selectors";

export function MacroRing() {
  const locale = useFarfurieStore((s) => s.locale);
  const goals = useEffectiveGoals();
  const totals = useTotals();
  const remaining = useRemaining();

  const budget = goals.kcal;
  const consumed = Math.round(totals.kcal);
  const pct = Math.min(100, Math.round((consumed / Math.max(budget, 1)) * 100));
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const proteinPct = Math.min(100, Math.round((totals.protein / Math.max(goals.protein, 1)) * 100));
  const carbsPct = Math.min(100, Math.round((totals.carbs / Math.max(goals.carbs, 1)) * 100));
  const fatPct = Math.min(100, Math.round((totals.fat / Math.max(goals.fat, 1)) * 100));

  return (
    <section className="surface animate-rise overflow-hidden p-5 md:p-6">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        {/* Ring central calorii */}
        <div className="relative grid h-44 w-44 place-items-center shrink-0">
          <svg className="-rotate-90" width="180" height="180" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--line)"
              strokeWidth="10"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <motion.p
                key={remaining.kcal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="display text-4xl font-extrabold text-gray-900 dark:text-white leading-none"
              >
                {Math.abs(Math.round(remaining.kcal))}
              </motion.p>
              <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {remaining.kcal >= 0
                  ? locale === "ro"
                    ? "Kcal Rămase"
                    : "Kcal Left"
                  : locale === "ro"
                  ? "Peste Plan"
                  : "Over Budget"}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {consumed} / {budget} kcal
              </p>
            </div>
          </div>
        </div>

        {/* Bare de Progres Macronutrienți */}
        <div className="w-full space-y-3.5">
          {/* Proteine */}
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {locale === "ro" ? "Proteine" : "Protein"}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {Math.round(totals.protein)} / {goals.protein}g ({proteinPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${proteinPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* Carbohidrați */}
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {locale === "ro" ? "Carbohidrați" : "Carbs"}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {Math.round(totals.carbs)} / {goals.carbs}g ({carbsPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${carbsPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* Grăsimi */}
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {locale === "ro" ? "Grăsimi" : "Fat"}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {Math.round(totals.fat)} / {goals.fat}g ({fatPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${fatPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


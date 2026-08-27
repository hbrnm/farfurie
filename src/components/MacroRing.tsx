"use client";

import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { localISO } from "@/lib/dates";
import { useFarfurieStore } from "@/lib/store";
import {
  useEffectiveGoals,
  useRemaining,
  useTotals,
} from "@/lib/selectors";

export function MacroRing() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const goals = useEffectiveGoals();
  const totals = useTotals();
  const remaining = useRemaining();

  const budget = goals.kcal;
  const pct = Math.min(100, Math.round((totals.kcal / Math.max(budget, 1)) * 100));
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <section className="surface animate-rise overflow-hidden p-6 text-center">
      {/* Clean Single Focus Ring */}
      <div className="relative mx-auto my-2 grid h-44 w-44 place-items-center">
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
            <p className="mt-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {remaining.kcal >= 0 ? "Kcal Rămase" : "Peste Plan"}
            </p>
          </div>
        </div>
      </div>

      {/* Clean Single Line Macro Summary */}
      <div className="mt-4 flex items-center justify-center gap-6 border-t border-[var(--line)] pt-4 text-xs font-semibold">
        <div>
          <span className="text-gray-500">Proteine: </span>
          <span className="font-bold text-emerald-600">{Math.round(totals.protein)} / {goals.protein}g</span>
        </div>
        <div>
          <span className="text-gray-500">Carbohidrați: </span>
          <span className="font-bold text-amber-600">{Math.round(totals.carbs)} / {goals.carbs}g</span>
        </div>
        <div>
          <span className="text-gray-500">Grăsimi: </span>
          <span className="font-bold text-rose-600">{Math.round(totals.fat)} / {goals.fat}g</span>
        </div>
      </div>
    </section>
  );
}

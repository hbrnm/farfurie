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

  // Level Up Guidance Logic based on remaining macros
  const guidanceTitle = remaining.protein > 20
    ? (locale === "ro" ? "Prioritizează proteina la următoarea masă" : "Prioritize protein for next meal")
    : remaining.kcal < 0
    ? (locale === "ro" ? "Buget caloric depășit — optează pentru o masă light" : "Calorie target exceeded — opt for a light meal")
    : (locale === "ro" ? "Echilibru optim — ești pe cale să îți atingi ținta" : "Optimal balance — you are on track");

  const guidanceDetail = remaining.protein > 20
    ? (locale === "ro" ? `Mai ai de acoperit ${Math.round(remaining.protein)}g proteină azi. Adaugă o sursă slabă de proteină.` : `You still need ${Math.round(remaining.protein)}g protein today. Add a lean protein source.`)
    : remaining.kcal < 0
    ? (locale === "ro" ? `Ai depășit ținta cu ${Math.abs(Math.round(remaining.kcal))} kcal. O plimbare de 20 min ajută la digestie.` : `Over target by ${Math.abs(Math.round(remaining.kcal))} kcal. A 20 min walk will aid digestion.`)
    : (locale === "ro" ? `Mai ai ${Math.round(remaining.kcal)} kcal disponibile pentru cina sau gustarea ta.` : `${Math.round(remaining.kcal)} kcal remaining for dinner or snack.`);

  return (
    <section className="surface animate-rise overflow-hidden p-5 md:p-6 dark:bg-[#121214] dark:border-zinc-800 shadow-xl">
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
              stroke={remaining.kcal < 0 ? "var(--level-red)" : "var(--brand)"}
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
                className="display text-4xl font-extrabold text-gray-900 dark:text-zinc-100 leading-none"
              >
                {Math.abs(Math.round(remaining.kcal))}
              </motion.p>
              <p className="mt-1 level-kicker text-gray-500 dark:text-zinc-400">
                {remaining.kcal >= 0
                  ? locale === "ro"
                    ? "Kcal Rămase"
                    : "Kcal Left"
                  : locale === "ro"
                  ? "Peste Plan"
                  : "Over Budget"}
              </p>
              <p className="mt-0.5 text-[11px] font-mono font-medium text-gray-500 dark:text-zinc-400">
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
              <span className="text-emerald-700 dark:text-[#55dc88] flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-[#55dc88]" />
                {locale === "ro" ? "Proteine" : "Protein"}
              </span>
              <span className="text-gray-700 dark:text-zinc-200 font-mono text-xs">
                {Math.round(totals.protein)} / {goals.protein}g ({proteinPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#1c1c1f] overflow-hidden border border-transparent dark:border-zinc-800">
              <motion.div
                className="h-full rounded-full bg-[#55dc88]"
                initial={{ width: 0 }}
                animate={{ width: `${proteinPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* Carbohidrați */}
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {locale === "ro" ? "Carbohidrați" : "Carbs"}
              </span>
              <span className="text-gray-700 dark:text-zinc-200 font-mono text-xs">
                {Math.round(totals.carbs)} / {goals.carbs}g ({carbsPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#1c1c1f] overflow-hidden border border-transparent dark:border-zinc-800">
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
              <span className="text-rose-700 dark:text-[#f13a30] flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-[#f13a30]" />
                {locale === "ro" ? "Grăsimi" : "Fat"}
              </span>
              <span className="text-gray-700 dark:text-zinc-200 font-mono text-xs">
                {Math.round(totals.fat)} / {goals.fat}g ({fatPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#1c1c1f] overflow-hidden border border-transparent dark:border-zinc-800">
              <motion.div
                className="h-full rounded-full bg-[#f13a30]"
                initial={{ width: 0 }}
                animate={{ width: `${fatPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* LEVEL UP GUIDANCE BOX */}
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:border-rose-500/40 dark:bg-rose-500/10 p-3 text-xs transition-all">
            <div className="flex items-center gap-2">
              <span className="level-kicker text-emerald-600 dark:text-[#f13a30]">
                NUTRITION GUIDANCE
              </span>
            </div>
            <p className="mt-1 font-bold text-gray-900 dark:text-zinc-100">
              {guidanceTitle}
            </p>
            <p className="mt-0.5 text-gray-600 dark:text-zinc-300 text-[11px] leading-relaxed">
              {guidanceDetail}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

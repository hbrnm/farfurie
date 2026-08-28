"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Plus, Utensils, Droplets, Flame, Sparkles } from "lucide-react";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { MacroRing } from "@/components/MacroRing";
import { type MealKey, useFarfurieStore } from "@/lib/store";
import { DiaryHeader } from "@/features/diary/components/DiaryHeader";
import { WeeklyCalendarStrip } from "@/features/diary/components/WeeklyCalendarStrip";
import { FillTheGapCard } from "@/features/diary/components/FillTheGapCard";
import { MealSection } from "@/features/diary/components/MealSection";
import { PlateEstimatorModal } from "@/features/diary/components/PlateEstimatorModal";
import { triggerHaptic } from "@/lib/haptics";
import { t } from "@/lib/i18n";

const meals: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];

export function DiaryBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const allEntries = useFarfurieStore((s) => s.entries);
  const waterByDate = useFarfurieStore((s) => s.waterByDate);
  const addWater = useFarfurieStore((s) => s.addWater);

  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
  const [openPlateEstimator, setOpenPlateEstimator] = useState(false);

  const entries = useMemo(
    () => allEntries.filter((e) => e.date === selectedDate),
    [allEntries, selectedDate],
  );

  const currentWaterMl = waterByDate[selectedDate] || 0;
  const targetWaterMl = 2380;
  const waterPct = Math.min(100, Math.round((currentWaterMl / targetWaterMl) * 100));

  const handleAddWater = () => {
    triggerHaptic("medium");
    addWater();
  };

  return (
    <div className="space-y-6">
      {/* 1. Bandă calendaristică săptămânală interactivă */}
      <WeeklyCalendarStrip />

      {/* 2. Alerte check-in săptămânal & mod recuperare */}
      <DiaryHeader />

      {/* 3. Dashboard Hero Macro Ring + Level Up Guidance Box */}
      <MacroRing />

      {/* 4. Bară de Acțiuni Rapide (Adaugă Mâncare, Estimează Farfuria, Pozează) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Adaugă Mâncare */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            triggerHaptic("medium");
            setOpenMeal("lunch");
          }}
          className="btn btn-primary w-full py-3.5 text-xs font-extrabold uppercase tracking-wider bg-emerald-600 dark:bg-[#55dc88] text-white dark:text-black shadow-md"
        >
          <Plus size={18} />
          <span>{locale === "ro" ? "Adaugă Mâncare" : "Add Food"}</span>
        </motion.button>

        {/* Estimează Farfuria */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            triggerHaptic("medium");
            setOpenPlateEstimator(true);
          }}
          className="btn btn-ghost w-full py-3.5 text-xs font-extrabold uppercase tracking-wider border-[var(--line)] bg-white dark:bg-[#121214] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          <Utensils size={18} className="text-emerald-500 dark:text-[#55dc88]" />
          <span>{locale === "ro" ? "Estimează Farfuria" : "Estimate Plate"}</span>
        </motion.button>

        {/* Pozează Farfuria */}
        <Link href="/app/plate" className="w-full">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => triggerHaptic("medium")}
            className="btn btn-ghost w-full py-3.5 text-xs font-extrabold uppercase tracking-wider border-[var(--line)] bg-white dark:bg-[#121214] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-sm"
          >
            <Camera size={18} className="text-emerald-500 dark:text-[#55dc88]" />
            <span>{locale === "ro" ? "Pozează Farfuria" : "Scan Plate AI"}</span>
          </motion.button>
        </Link>
      </div>

      {/* 5. Card inteligent Umple Golul (AI Recommendations) */}
      <FillTheGapCard />

      {/* 6. Secțiuni Mese Full-Width (Mic Dejun, Prânz, Cină, Gustări) */}
      <div className="space-y-4">
        {meals.map((meal) => (
          <MealSection
            key={meal}
            meal={meal}
            entries={entries}
            onOpenAddSheet={(m) => setOpenMeal(m)}
          />
        ))}
      </div>

      {/* 7. Bară de Monitorizare Hidratare & Obiceiuri la Bază */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card Hidratare / Apă */}
        <div className="surface p-4 dark:bg-[#121214] dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Droplets size={16} />
              {locale === "ro" ? "Hidratare & Apă" : "Water Intake"}
            </span>
            <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
              {currentWaterMl} / {targetWaterMl} ml
            </span>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-blue-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${waterPct}%` }}
            />
          </div>

          <button
            type="button"
            onClick={handleAddWater}
            className="mt-3 w-full rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all"
          >
            + 250 ml {locale === "ro" ? "Apă" : "Water"}
          </button>
        </div>

        {/* Card Zile Consecutive (Streak) */}
        <div className="surface p-4 dark:bg-[#121214] dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Flame size={16} />
              {locale === "ro" ? "Zile Consecutive" : "Daily Streak"}
            </span>
            <span className="font-mono text-lg font-extrabold text-amber-500">14 🔥</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {locale === "ro"
              ? "Continuitatea bate perfecțiunea. Continuă să loghezi zilnic!"
              : "Consistency over perfection. Keep logging every day!"}
          </p>
        </div>
      </div>

      {/* Sheet Căutare Mâncare */}
      {openMeal && <AddFoodSheet meal={openMeal} onClose={() => setOpenMeal(null)} />}

      {/* Modal Interactiv Estimează Farfuria */}
      {openPlateEstimator && (
        <PlateEstimatorModal onClose={() => setOpenPlateEstimator(false)} />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Utensils, PieChart, Sparkles, Plus } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { t } from "@/lib/i18n";
import { type MealKey, useFarfurieStore } from "@/lib/store";
import { plateMacros, plateTemplates, type PlateTemplate } from "@/lib/plates";

type Props = {
  initialMeal?: MealKey;
  onClose: () => void;
};

export function PlateEstimatorModal({ initialMeal = "lunch", onClose }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);

  const [selectedPlate, setSelectedPlate] = useState<PlateTemplate>(plateTemplates[0]);
  const [targetMeal, setTargetMeal] = useState<MealKey>(initialMeal);
  const [portionScale, setPortionScale] = useState<number>(1.0);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const baseMacros = plateMacros(selectedPlate.items);
  const scaledKcal = Math.round(baseMacros.kcal * portionScale);
  const scaledProtein = Math.round(baseMacros.protein * portionScale * 10) / 10;
  const scaledCarbs = Math.round(baseMacros.carbs * portionScale * 10) / 10;
  const scaledFat = Math.round(baseMacros.fat * portionScale * 10) / 10;

  const handleAddPlate = () => {
    triggerHaptic("heavy");
    selectedPlate.items.forEach((item) => {
      const adjustedGrams = Math.round(item.grams * portionScale);
      addFoodToMeal(item.foodId, targetMeal, adjustedGrams);
    });

    const mealLabel = t(locale, targetMeal);
    setSuccessNotice(
      locale === "ro"
        ? `Adăugat ${selectedPlate.nameRo} în ${mealLabel}! (${scaledKcal} kcal)`
        : `Added ${selectedPlate.nameEn} to ${mealLabel}! (${scaledKcal} kcal)`
    );

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line)] bg-white dark:bg-[#121214] p-6 shadow-2xl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-[#55dc88]">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="display text-xl font-extrabold text-gray-900 dark:text-white">
                {t(locale, "plateEstimate")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {locale === "ro"
                  ? "Regula farfuriei echilibrate: ½ legume, ¼ proteine, ¼ carbohidrați."
                  : "Balanced plate rule: ½ vegetables, ¼ protein, ¼ carbs."}
              </p>
            </div>
          </div>

          {/* Visual Plate Diagram (1/2 + 1/4 + 1/4) */}
          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-gray-50 dark:bg-[#0e1012] p-4 text-center">
            <p className="level-kicker text-emerald-600 dark:text-[#55dc88]">COMPAZIȚIA FARFURIEI</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-left text-xs">
              <div className="col-span-2 flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  🥬 ½ Legume proaspete & Salată
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-[#55dc88]">50% Farfurie</span>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5">
                <span className="font-bold text-rose-800 dark:text-rose-300">
                  🍗 ¼ Proteină slabă
                </span>
                <span className="mt-1 font-mono text-[11px] text-rose-600 dark:text-[#f13a30]">25% Farfurie</span>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-amber-500/15 border border-amber-500/30 p-2.5">
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  🥔 ¼ Garnitură / Carbs
                </span>
                <span className="mt-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">25% Farfurie</span>
              </div>
            </div>
          </div>

          {/* Preset Plate Selector */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              {locale === "ro" ? "Alege modelul de farfurie" : "Select plate template"}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {plateTemplates.map((plate) => {
                const isSel = plate.id === selectedPlate.id;
                const macros = plateMacros(plate.items);
                return (
                  <button
                    key={plate.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setSelectedPlate(plate);
                    }}
                    className={`flex flex-col justify-between rounded-2xl border p-3 text-left transition-all ${
                      isSel
                        ? "border-emerald-500 bg-emerald-500/10 dark:border-[#55dc88] dark:bg-[#55dc88]/10 ring-1 ring-emerald-500 dark:ring-[#55dc88]"
                        : "border-[var(--line)] bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {locale === "ro" ? plate.nameRo : plate.nameEn}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                        {locale === "ro" ? plate.reasonRo : plate.reasonEn}
                      </p>
                    </div>
                    <p className="mt-2 text-xs font-black text-emerald-600 dark:text-[#55dc88]">
                      ~{macros.kcal} kcal · P {macros.protein}g
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portion Scale Selector */}
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-gray-50 dark:bg-zinc-900/60 p-3">
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
              {locale === "ro" ? "Dimensiune Porție:" : "Portion Size:"}
            </span>
            <div className="flex gap-1.5 text-xs font-bold">
              {[
                { scale: 0.8, label: "Mică (0.8x)" },
                { scale: 1.0, label: "Standard (1x)" },
                { scale: 1.3, label: "Mare (1.3x)" },
              ].map(({ scale, label }) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setPortionScale(scale);
                  }}
                  className={`rounded-full px-3 py-1 transition-all ${
                    portionScale === scale
                      ? "bg-emerald-600 dark:bg-[#f13a30] text-white shadow-sm font-extrabold"
                      : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-[var(--line)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Slot Selector */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
              {locale === "ro" ? "Adaugă în:" : "Add to:"}
            </span>
            <div className="flex gap-1 overflow-x-auto text-xs font-semibold">
              {(["breakfast", "lunch", "dinner", "snack"] as MealKey[]).map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setTargetMeal(meal);
                  }}
                  className={`rounded-xl px-3 py-1.5 transition-all ${
                    targetMeal === meal
                      ? "bg-emerald-600 dark:bg-[#55dc88] text-white dark:text-black font-extrabold"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200"
                  }`}
                >
                  {t(locale, meal)}
                </button>
              ))}
            </div>
          </div>

          {/* Scaled Macro Summary & Confirm Action */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-zinc-900 text-white p-3.5">
              <div>
                <span className="level-kicker text-emerald-400">TOTAL ESTIMAT</span>
                <p className="display text-2xl font-extrabold mt-0.5">{scaledKcal} kcal</p>
              </div>
              <div className="text-right font-mono text-xs text-zinc-300 space-y-0.5">
                <p><span className="text-[#55dc88]">Proteine:</span> {scaledProtein}g</p>
                <p><span className="text-amber-400">Carbs:</span> {scaledCarbs}g</p>
                <p><span className="text-[#f13a30]">Grăsimi:</span> {scaledFat}g</p>
              </div>
            </div>

            {successNotice ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-emerald-600 dark:text-[#55dc88] font-bold text-sm">
                <Check size={18} />
                <span>{successNotice}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddPlate}
                className="w-full btn btn-primary bg-emerald-600 dark:bg-[#f13a30] text-white hover:bg-emerald-500 dark:hover:bg-rose-600 py-3.5 font-extrabold text-sm uppercase tracking-wider shadow-lg"
              >
                <Plus size={16} />
                {locale === "ro"
                  ? `Adaugă Farfuria în ${t(locale, targetMeal)}`
                  : `Add Plate to ${t(locale, targetMeal)}`}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

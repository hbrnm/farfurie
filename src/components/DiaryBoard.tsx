"use client";

import { useMemo, useState } from "react";
import { CopyPlus, Plus, Share2, ShoppingCart, Sparkles, Undo2, X } from "lucide-react";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { fillTheGap } from "@/lib/fillGap";
import { t } from "@/lib/i18n";
import { shiftISO } from "@/lib/dates";
import { plateMacros, plateTemplates } from "@/lib/plates";
import { dayShareText } from "@/lib/share";
import { useEffectiveGoals, useRemaining, useTotals } from "@/lib/selectors";
import { type MealKey, useFarfurieStore } from "@/lib/store";

const meals: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];

export function DiaryBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const allEntries = useFarfurieStore((s) => s.entries);
  const remaining = useRemaining();
  const totals = useTotals();
  const goals = useEffectiveGoals();
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addRecipeToMeal = useFarfurieStore((s) => s.addRecipeToMeal);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const removeEntry = useFarfurieStore((s) => s.removeEntry);
  const undoLastEntry = useFarfurieStore((s) => s.undoLastEntry);
  const lastAddedId = useFarfurieStore((s) => s.lastAddedId);
  const saveMealFromSelected = useFarfurieStore((s) => s.saveMealFromSelected);
  const setDayNote = useFarfurieStore((s) => s.setDayNote);
  const dayNotes = useFarfurieStore((s) => s.dayNotes);
  const addSelectedDayToShopping = useFarfurieStore((s) => s.addSelectedDayToShopping);
  const recovery = useFarfurieStore((s) => s.isRecovery());
  const startRecovery = useFarfurieStore((s) => s.startRecovery);
  const stopRecovery = useFarfurieStore((s) => s.stopRecovery);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const copyMealToDate = useFarfurieStore((s) => s.copyMealToDate);
  const waterMl = useFarfurieStore((s) => s.waterForSelected());
  const burned = useFarfurieStore((s) => s.burnedToday());
  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
  const [showGap, setShowGap] = useState(true);
  const [saveName, setSaveName] = useState("");
  const [saveFor, setSaveFor] = useState<MealKey>("lunch");
  const [shareMsg, setShareMsg] = useState("");
  const [copiedMeal, setCopiedMeal] = useState<MealKey | null>(null);

  const entries = useMemo(
    () => allEntries.filter((e) => e.date === selectedDate),
    [allEntries, selectedDate],
  );
  const gap = useMemo(() => fillTheGap(remaining), [remaining]);
  const note = dayNotes[selectedDate] ?? "";

  const share = async () => {
    const text = dayShareText({
      locale,
      date: selectedDate,
      entries,
      totals,
      goalKcal: goals.kcal,
      burned,
      waterMl,
    });
    try {
      await navigator.clipboard.writeText(text);
      setShareMsg(t(locale, "copiedShare"));
    } catch {
      setShareMsg(text);
    }
    window.setTimeout(() => setShareMsg(""), 2500);
  };

  return (
    <div className="space-y-5">
      {recovery && (
        <section className="surface border-brand/40 p-4">
          <p className="font-semibold text-brand">{t(locale, "recovery")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "recoveryOn")}</p>
          <button type="button" className="btn btn-ghost mt-3 !px-3 !py-1.5 text-sm" onClick={stopRecovery}>
            {t(locale, "recoveryStop")}
          </button>
        </section>
      )}
      {holidayMode && !recovery && (
        <section className="surface border-accent/40 p-4">
          <p className="font-semibold">{t(locale, "holidays")}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(locale, "featureRecoveryText")}</p>
          <button type="button" className="btn btn-primary mt-3 text-sm" onClick={startRecovery}>
            {t(locale, "recoveryStart")}
          </button>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost !px-3 !py-2 text-sm"
          disabled={!lastAddedId}
          onClick={undoLastEntry}
        >
          <Undo2 size={14} />
          {t(locale, "undo")}
        </button>
        <button type="button" className="btn btn-ghost !px-3 !py-2 text-sm" onClick={() => void share()}>
          <Share2 size={14} />
          {t(locale, "shareDay")}
        </button>
        <button type="button" className="btn btn-ghost !px-3 !py-2 text-sm" onClick={addSelectedDayToShopping}>
          <ShoppingCart size={14} />
          {t(locale, "shopFromDay")}
        </button>
        <button
          type="button"
          className="btn btn-ghost !px-3 !py-2 text-sm"
          onClick={() => addFoodToMeal("bere-silva", "snack")}
        >
          {t(locale, "logBeer")}
        </button>
        <button
          type="button"
          className="btn btn-ghost !px-3 !py-2 text-sm"
          onClick={() => addFoodToMeal("vin-feteasca", "snack")}
        >
          {t(locale, "logWine")}
        </button>
      </div>
      {shareMsg && <p className="text-sm font-semibold text-brand">{shareMsg}</p>}

      <label className="surface block p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {t(locale, "dayNote")}
        </span>
        <textarea
          value={note}
          onChange={(e) => setDayNote(selectedDate, e.target.value)}
          placeholder={t(locale, "dayNotePh")}
          rows={2}
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
        />
      </label>

      <section className="surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {t(locale, "plateEstimate")}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {plateTemplates.map((plate) => {
            const macros = plateMacros(plate.items);
            return (
              <button
                key={plate.id}
                type="button"
                className="rounded-2xl border border-[var(--line)] bg-white/70 p-3 text-left hover:border-brand/40"
                onClick={() => {
                  plate.items.forEach((item) => addFoodToMeal(item.foodId, "lunch", item.grams));
                }}
              >
                <p className="font-semibold">{locale === "ro" ? plate.nameRo : plate.nameEn}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {locale === "ro" ? plate.reasonRo : plate.reasonEn}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand">
                  {t(locale, "addPlate")} · {macros.kcal} kcal · P {macros.protein}g
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {showGap && gap.length > 0 && (
        <section className="surface animate-rise overflow-hidden p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold text-brand">
                <Sparkles size={16} />
                {t(locale, "fillGap")}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{t(locale, "fillGapDesc")}</p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-ink-soft hover:bg-white"
              onClick={() => setShowGap(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {gap.map((s) => (
              <button
                key={s.id}
                type="button"
                className="rounded-2xl border border-[var(--line)] bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/30"
                onClick={() => {
                  if (s.kind === "food" && s.foodId) {
                    addFoodToMeal(s.foodId, "dinner", s.grams);
                  } else if (s.recipeId) {
                    addRecipeToMeal(s.recipeId, "dinner");
                  } else {
                    addEntry({
                      meal: "dinner",
                      nameRo: s.nameRo,
                      nameEn: s.nameEn,
                      macros: s.macros,
                    });
                  }
                }}
              >
                <p className="font-semibold">
                  {locale === "ro" ? s.nameRo : s.nameEn}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {locale === "ro" ? s.reasonRo : s.reasonEn}
                </p>
                <p className="mt-3 text-sm font-semibold text-brand">
                  {s.macros.kcal} kcal · P {s.macros.protein}g
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {meals.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal === meal);
          const mealKcal = mealEntries.reduce((a, e) => a + e.macros.kcal, 0);
          return (
            <section key={meal} className="surface p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="display text-xl">{t(locale, meal)}</h3>
                  <p className="text-xs text-ink-soft">{mealKcal} kcal</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-full p-2 text-ink-soft hover:bg-white disabled:opacity-30"
                    disabled={mealEntries.length === 0}
                    title={t(locale, "copyTomorrow")}
                    onClick={() => {
                      const n = copyMealToDate(meal, shiftISO(selectedDate, 1));
                      if (n > 0) {
                        setCopiedMeal(meal);
                        window.setTimeout(() => setCopiedMeal(null), 1800);
                      }
                    }}
                  >
                    <CopyPlus size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost !px-3 !py-2 text-sm"
                    onClick={() => setOpenMeal(meal)}
                  >
                    <Plus size={16} />
                    {t(locale, "add")}
                  </button>
                </div>
              </div>
              {copiedMeal === meal && (
                <p className="mb-2 text-xs font-semibold text-brand">{t(locale, "copiedTomorrow")}</p>
              )}
              {mealEntries.length === 0 ? (
                <p className="rounded-2xl bg-white/50 px-3 py-4 text-sm text-ink-soft">
                  {t(locale, "emptyMeal")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {mealEntries.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {locale === "ro" ? e.nameRo : e.nameEn}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {e.macros.kcal} kcal · P {e.macros.protein}g · C{" "}
                          {e.macros.carbs}g · F {e.macros.fat}g
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-ink-soft hover:bg-[var(--bg)]"
                        onClick={() => removeEntry(e.id)}
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <section className="surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {t(locale, "saveMeal")}
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select
            className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
            value={saveFor}
            onChange={(e) => setSaveFor(e.target.value as MealKey)}
          >
            {meals.map((m) => (
              <option key={m} value={m}>
                {t(locale, m)}
              </option>
            ))}
          </select>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={t(locale, "mealName")}
            className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="btn btn-primary text-sm"
            onClick={() => {
              saveMealFromSelected(saveFor, saveName);
              setSaveName("");
            }}
          >
            {t(locale, "saveMeal")}
          </button>
        </div>
      </section>

      {openMeal && <AddFoodSheet meal={openMeal} onClose={() => setOpenMeal(null)} />}
    </div>
  );
}

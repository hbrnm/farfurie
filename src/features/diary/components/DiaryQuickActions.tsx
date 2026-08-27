"use client";

import { useState } from "react";
import { Share2, ShoppingCart, Undo2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { dayShareText } from "@/lib/share";
import { type DiaryEntry, type MealKey, useFarfurieStore } from "@/lib/store";
import { useTotals } from "@/lib/selectors";

const meals: MealKey[] = ["breakfast", "lunch", "dinner", "snack"];

type Props = {
  entries: DiaryEntry[];
};

export function DiaryQuickActions({ entries }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const selectedDate = useFarfurieStore((s) => s.selectedDate);
  const lastAddedId = useFarfurieStore((s) => s.lastAddedId);
  const undoLastEntry = useFarfurieStore((s) => s.undoLastEntry);
  const addSelectedDayToShopping = useFarfurieStore((s) => s.addSelectedDayToShopping);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const setDayNote = useFarfurieStore((s) => s.setDayNote);
  const dayNotes = useFarfurieStore((s) => s.dayNotes);
  const saveMealFromSelected = useFarfurieStore((s) => s.saveMealFromSelected);
  const goals = useFarfurieStore((s) => s.goals);
  const waterMl = useFarfurieStore((s) => s.waterForSelected());
  const burned = useFarfurieStore((s) => s.burnedToday());
  const totals = useTotals();

  const [shareMsg, setShareMsg] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saveFor, setSaveFor] = useState<MealKey>("lunch");

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
    <div className="space-y-4">
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
    </div>
  );
}

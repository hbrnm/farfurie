"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

export function CustomFoodForm() {
  const locale = useFarfurieStore((s) => s.locale);
  const addCustomFood = useFarfurieStore((s) => s.addCustomFood);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState(120);
  const [protein, setProtein] = useState(8);
  const [carbs, setCarbs] = useState(10);
  const [fat, setFat] = useState(4);

  return (
    <section className="surface space-y-3 p-5">
      <h2 className="display text-xl">{t(locale, "customFood")}</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={locale === "ro" ? "Nume aliment" : "Food name"}
        className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
      />
      <div className="grid grid-cols-4 gap-2">
        <Num label="kcal" value={kcal} onChange={setKcal} />
        <Num label="P" value={protein} onChange={setProtein} />
        <Num label="C" value={carbs} onChange={setCarbs} />
        <Num label="F" value={fat} onChange={setFat} />
      </div>
      <button
        type="button"
        className="btn btn-ghost w-full text-sm"
        onClick={() => {
          if (!name.trim()) return;
          addCustomFood({
            nameRo: name.trim(),
            nameEn: name.trim(),
            per100g: { kcal, protein, carbs, fat },
            defaultGrams: 100,
          });
          const id = useFarfurieStore.getState().customFoods.at(-1)?.id;
          if (id) addFoodToMeal(id, "snack", 100);
          setName("");
        }}
      >
        {t(locale, "add")}
      </button>
    </section>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="text-xs text-ink-soft">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-2 py-1.5 text-sm font-semibold text-ink"
      />
    </label>
  );
}

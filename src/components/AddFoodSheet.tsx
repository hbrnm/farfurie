"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mic, ScanBarcode, X } from "lucide-react";
import {
  foodName,
  foodUnit,
  foods,
  macrosForGrams,
  pricePer20gProtein,
  searchFoods,
  type Food,
} from "@/lib/foods";
import { t } from "@/lib/i18n";
import { lookupBarcodeLive, searchFoodsLive } from "@/lib/off-client";
import { type MealKey, useFarfurieStore } from "@/lib/store";

const PORTIONS = [0.5, 1, 1.5, 2];

export function AddFoodSheet({
  meal,
  onClose,
}: {
  meal: MealKey;
  onClose: () => void;
}) {
  const locale = useFarfurieStore((s) => s.locale);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addCustomFood = useFarfurieStore((s) => s.addCustomFood);
  const quickAdd = useFarfurieStore((s) => s.quickAdd);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const favoriteFoodIds = useFarfurieStore((s) => s.favoriteFoodIds);
  const toggleFavoriteFood = useFarfurieStore((s) => s.toggleFavoriteFood);
  const allEntries = useFarfurieStore((s) => s.entries);
  const savedMeals = useFarfurieStore((s) => s.savedMeals);
  const addSavedMealToDiary = useFarfurieStore((s) => s.addSavedMealToDiary);
  const catalogFoods = useFarfurieStore((s) => s.catalogFoods);
  const addCatalogFood = useFarfurieStore((s) => s.addCatalogFood);

  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState(200);
  const [customProtein, setCustomProtein] = useState(10);
  const [customCarbs, setCustomCarbs] = useState(20);
  const [customFat, setCustomFat] = useState(8);
  const [barcodeMsg, setBarcodeMsg] = useState("");
  const [offHits, setOffHits] = useState<Food[]>([]);

  const results = useMemo(
    () => searchFoods(query, locale, catalogFoods),
    [query, locale, catalogFoods],
  );
  const macros = picked ? macrosForGrams(picked, grams) : null;
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const list: typeof allEntries = [];
    for (let i = allEntries.length - 1; i >= 0; i -= 1) {
      const e = allEntries[i];
      if (seen.has(e.nameRo)) continue;
      seen.add(e.nameRo);
      list.push(e);
      if (list.length >= 4) break;
    }
    return list;
  }, [allEntries]);
  const favorites = foods.filter((f) => favoriteFoodIds.includes(f.id));

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || /^\d{8,}$/.test(q)) {
      setOffHits([]);
      return;
    }
    const id = window.setTimeout(() => {
      void searchFoodsLive(q).then(setOffHits);
    }, 400);
    return () => window.clearTimeout(id);
  }, [query]);

  const applyBarcode = (raw: string) => {
    void (async () => {
      const food = await lookupBarcodeLive(raw);
      if (!food) {
        setBarcodeMsg(t(locale, "notFoundBarcode"));
        return;
      }
      addCatalogFood(food);
      setPicked(food);
      setGrams(food.defaultGrams);
      setQuery(foodName(food, locale));
      setBarcodeMsg(
        `${foodName(food, locale)}${food.brand ? ` · ${food.brand}` : ""}${
          food.id.startsWith("off-") ? " · Open Food Facts" : ""
        }`,
      );
    })();
  };

  const confirmFood = () => {
    if (!picked) return;
    addCatalogFood(picked);
    addFoodToMeal(picked.id, meal, grams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 md:place-items-center md:p-6">
      <div className="surface max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl p-5 md:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="display text-2xl">
            {t(locale, "addFood")} · {t(locale, meal)}
          </h3>
          <button type="button" className="rounded-full p-2 hover:bg-white" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label className="mb-3 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2">
          <ScanBarcode size={16} className="text-brand" />
          <input
            inputMode="numeric"
            placeholder={t(locale, "barcode")}
            className="w-full bg-transparent text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") applyBarcode((e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => {
              if (e.target.value.trim()) applyBarcode(e.target.value);
            }}
          />
        </label>
        <p className="mb-3 text-xs text-ink-soft">
          {barcodeMsg || t(locale, "barcodeDemo")}{" "}
          <Link href="/app/scan" className="font-semibold text-brand">
            {t(locale, "navScan")}
          </Link>
        </p>

        <label className="mb-3 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2">
          <ScanBarcode size={16} className="text-brand" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              const digits = e.target.value.replace(/\D/g, "");
              if (digits.length >= 8 && digits.length <= 14) {
                void lookupBarcodeLive(digits).then((food) => {
                  if (!food) return;
                  addCatalogFood(food);
                  setPicked(food);
                  setGrams(food.defaultGrams);
                });
              }
            }}
            placeholder={t(locale, "searchFood")}
            className="w-full bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            className="rounded-full p-1.5 text-brand hover:bg-brand/10"
            title={t(locale, "speakFood")}
            onClick={() => {
              const Ctor = (
                window as unknown as {
                  SpeechRecognition?: new () => {
                    lang: string;
                    onresult: ((ev: { results: Array<Array<{ transcript: string }>> }) => void) | null;
                    start: () => void;
                  };
                  webkitSpeechRecognition?: new () => {
                    lang: string;
                    onresult: ((ev: { results: Array<Array<{ transcript: string }>> }) => void) | null;
                    start: () => void;
                  };
                }
              ).SpeechRecognition ??
                (
                  window as unknown as {
                    webkitSpeechRecognition?: new () => {
                      lang: string;
                      onresult: ((ev: { results: Array<Array<{ transcript: string }>> }) => void) | null;
                      start: () => void;
                    };
                  }
                ).webkitSpeechRecognition;
              if (!Ctor) return;
              const rec = new Ctor();
              rec.lang = locale === "ro" ? "ro-RO" : "en-US";
              rec.onresult = (ev) => {
                const said = ev.results?.[0]?.[0]?.transcript ?? "";
                if (said) setQuery(said);
              };
              rec.start();
            }}
          >
            <Mic size={16} />
          </button>
        </label>

        {query.trim() === "" && (
          <>
            {favorites.length > 0 && (
              <ChipRow
                label={t(locale, "favorites")}
                items={favorites.map((f) => ({
                  key: f.id,
                  label: foodName(f, locale),
                  onClick: () => {
                    setPicked(f);
                    setGrams(f.defaultGrams);
                  },
                }))}
              />
            )}
            {recent.length > 0 && (
              <ChipRow
                label={t(locale, "recentFoods")}
                items={recent.map((e) => ({
                  key: e.id,
                  label: locale === "ro" ? e.nameRo : e.nameEn,
                  onClick: () => {
                    addEntry({
                      meal,
                      nameRo: e.nameRo,
                      nameEn: e.nameEn,
                      macros: e.macros,
                    });
                    onClose();
                  },
                }))}
              />
            )}
            {savedMeals.length > 0 && (
              <ChipRow
                label={t(locale, "savedMeals")}
                items={savedMeals.map((m) => ({
                  key: m.id,
                  label: locale === "ro" ? m.nameRo : m.nameEn,
                  onClick: () => {
                    addSavedMealToDiary(m.id);
                    onClose();
                  },
                }))}
              />
            )}
          </>
        )}

        {picked && macros && (
          <div className="mb-4 rounded-2xl border border-brand/30 bg-brand/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{foodName(picked, locale)}</p>
                <p className="text-xs text-ink-soft">
                  {picked.brand ? `${picked.brand} · ` : ""}
                  {foodUnit(picked, locale)}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-brand"
                onClick={() => toggleFavoriteFood(picked.id)}
              >
                {favoriteFoodIds.includes(picked.id) ? "★" : "☆"}
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-brand">
              {macros.kcal} kcal · P {macros.protein}g · C {macros.carbs}g · F {macros.fat}g
            </p>
            {pricePer20gProtein(picked) != null && (
              <p className="text-xs text-ink-soft">
                {pricePer20gProtein(picked)} {t(locale, "priceProteinShort")}
              </p>
            )}
            <label className="mt-3 block text-xs font-semibold text-ink-soft">
              {t(locale, "grams")}: {grams}g
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-[11px] font-semibold uppercase text-ink-soft">
                {t(locale, "portionChips")}
              </span>
              {PORTIONS.map((mult) => (
                <button
                  key={mult}
                  type="button"
                  className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-semibold"
                  onClick={() => setGrams(Math.round(picked.defaultGrams * mult))}
                >
                  {mult === 1 ? foodUnit(picked, locale) : `×${mult}`}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary mt-3 w-full text-sm" onClick={confirmFood}>
              {t(locale, "add")} · {macros.kcal} kcal
            </button>
          </div>
        )}

        <ul className="space-y-2">
          {results.length === 0 && offHits.length === 0 && (
            <li className="text-sm text-ink-soft">{t(locale, "noResults")}</li>
          )}
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/80 px-3 py-3 text-left hover:border-brand/40"
                onClick={() => {
                  setPicked(food);
                  setGrams(food.defaultGrams);
                }}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {foodName(food, locale)}
                    {food.brand ? (
                      <span className="ml-2 text-xs font-medium text-ink-soft">{food.brand}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {foodUnit(food, locale)} · {food.defaultGrams}g
                    {pricePer20gProtein(food) != null
                      ? ` · ${pricePer20gProtein(food)} ${t(locale, "priceProteinShort")}`
                      : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand">
                  {Math.round((food.per100g.kcal * food.defaultGrams) / 100)} kcal
                </span>
              </button>
            </li>
          ))}
        </ul>
        {offHits.filter((f) => !results.some((r) => r.ean && r.ean === f.ean)).length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Open Food Facts
            </p>
            <ul className="space-y-2">
              {offHits
                .filter((f) => !results.some((r) => r.ean && r.ean === f.ean))
                .map((food) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-brand/5 px-3 py-3 text-left"
                      onClick={() => {
                        addCatalogFood(food);
                        setPicked(food);
                        setGrams(food.defaultGrams);
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold">{foodName(food, locale)}</p>
                        <p className="text-xs text-ink-soft">
                          {food.brand ?? "OFF"} · {food.ean}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-brand">
                        {Math.round((food.per100g.kcal * food.defaultGrams) / 100)} kcal
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <form
          className="mt-5 space-y-3 rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (customKcal <= 0) return;
            const macros = {
              kcal: customKcal,
              protein: customProtein,
              carbs: customCarbs,
              fat: customFat,
            };
            if (customName.trim()) addCustomFood(meal, customName, macros);
            else quickAdd(meal, macros);
            onClose();
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {t(locale, "quickAdd")}
          </p>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={t(locale, "customName")}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                ["kcal", customKcal, setCustomKcal],
                ["P", customProtein, setCustomProtein],
                ["C", customCarbs, setCustomCarbs],
                ["F", customFat, setCustomFat],
              ] as const
            ).map(([label, value, setValue]) => (
              <label key={label} className="text-[11px] font-semibold text-ink-soft">
                {label}
                <input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-2 py-1.5 text-sm font-medium text-ink"
                />
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn-primary w-full text-sm">
            {t(locale, "addCustom")}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChipRow({
  label,
  items,
}: {
  label: string;
  items: { key: string; label: string; onClick: () => void }[];
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold hover:border-brand/40"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

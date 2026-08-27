"use client";

import { useState } from "react";
import { ScanBarcode, Sparkles, Type } from "lucide-react";
import { t } from "@/lib/i18n";
import { type MealKey, useFarfurieStore } from "@/lib/store";

export function LoggingDock({ meal }: { meal: MealKey }) {
  const locale = useFarfurieStore((s) => s.locale);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function logText() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/food/parse-text", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, locale, meal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(t(locale, "noResults"));
        return;
      }
      addFoodToMeal(data.foodId, data.meal, data.grams);
      setText("");
      setStatus(`${data.nameRo} · ${data.grams}g`);
    } catch {
      setStatus(t(locale, "networkError"));
    } finally {
      setBusy(false);
    }
  }

  async function logBarcode() {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/food/barcode?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.found) {
        setStatus(t(locale, "noResults"));
        return;
      }
      addFoodToMeal(data.food.id, meal, data.food.defaultGrams);
      setCode("");
      setStatus(locale === "ro" ? data.food.nameRo : data.food.nameEn);
    } catch {
      setStatus(t(locale, "networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface space-y-4 p-5">
      <p className="text-sm font-semibold text-ink-soft">{t(locale, "logByText")}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t(locale, "logByTextHint")}
          className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          className="btn btn-primary text-sm"
          disabled={busy}
          onClick={logText}
        >
          <Type size={14} />
          {t(locale, "add")}
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t(locale, "barcodeHint")}
          className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
        />
        <button type="button" className="btn btn-ghost text-sm" disabled={busy} onClick={logBarcode}>
          <ScanBarcode size={14} />
          {t(locale, "scan")}
        </button>
      </div>
      {status && (
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
          <Sparkles size={12} />
          {status}
        </p>
      )}
    </section>
  );
}

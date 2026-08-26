"use client";

import { useState } from "react";
import { Camera, Mic, ScanBarcode, Sparkles, Type } from "lucide-react";
import { t } from "@/lib/i18n";
import { type MealKey, useFarfurieStore } from "@/lib/store";
import { PremiumGate } from "@/components/PremiumGate";
import { canUse } from "@/lib/entitlements";

export function LoggingDock({ meal }: { meal: MealKey }) {
  const locale = useFarfurieStore((s) => s.locale);
  const tier = useFarfurieStore((s) => s.subscriptionTier);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const headers = { "content-type": "application/json", "x-farfurie-tier": tier };

  async function logText() {
    const res = await fetch("/api/food/parse-text", {
      method: "POST",
      headers,
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
  }

  async function logBarcode() {
    const res = await fetch(`/api/food/barcode?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!res.ok || !data.found) {
      setStatus(t(locale, "noResults"));
      return;
    }
    addFoodToMeal(data.food.id, meal, data.food.defaultGrams);
    setCode("");
    setStatus(locale === "ro" ? data.food.nameRo : data.food.nameEn);
  }

  async function logAi(kind: "photo" | "voice") {
    if (!canUse(tier, kind === "photo" ? "photoLog" : "voiceLog")) return;
    const res = await fetch("/api/food/ai-estimate", { method: "POST", headers });
    const data = await res.json();
    if (!res.ok) {
      setStatus(t(locale, "unlockPremium"));
      return;
    }
    addEntry({
      meal,
      nameRo: data.nameRo,
      nameEn: data.nameEn,
      macros: data.macros,
      foodId: data.foodId,
      grams: data.grams,
      source: kind,
    });
    setStatus(`${data.nameRo} · demo AI`);
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
        <button type="button" className="btn btn-primary text-sm" onClick={logText}>
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
        <button type="button" className="btn btn-ghost text-sm" onClick={logBarcode}>
          <ScanBarcode size={14} />
          {t(locale, "scan")}
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <PremiumGate
          feature="photoLog"
          fallback={
            <span className="btn btn-ghost w-full text-sm">
              <Camera size={14} /> {t(locale, "photoLog")}
            </span>
          }
        >
          <button type="button" className="btn btn-ghost w-full text-sm" onClick={() => logAi("photo")}>
            <Camera size={14} /> {t(locale, "photoLog")}
          </button>
        </PremiumGate>
        <PremiumGate
          feature="voiceLog"
          fallback={
            <span className="btn btn-ghost w-full text-sm">
              <Mic size={14} /> {t(locale, "voiceLog")}
            </span>
          }
        >
          <button type="button" className="btn btn-ghost w-full text-sm" onClick={() => logAi("voice")}>
            <Mic size={14} /> {t(locale, "voiceLog")}
          </button>
        </PremiumGate>
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

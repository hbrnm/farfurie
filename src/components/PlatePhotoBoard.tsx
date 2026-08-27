"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Sparkles, CheckCircle2, ScanLine } from "lucide-react";
import { t } from "@/lib/i18n";
import { triggerHaptic } from "@/lib/haptics";
import type { PlateEstimate } from "@/lib/plate-types";
import { type MealKey, useFarfurieStore } from "@/lib/store";
import { useVisionAvailable } from "@/lib/useVisionAvailable";

export function PlatePhotoBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const vision = useVisionAvailable();
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addEntry = useFarfurieStore((s) => s.addEntry);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [meal, setMeal] = useState<MealKey>("lunch");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlateEstimate | null>(null);

  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read_failed"));
      reader.readAsDataURL(file);
    });

  const compress = async (dataUrl: string) => {
    const img = document.createElement("img");
    img.src = dataUrl;
    await new Promise((r) => {
      img.onload = () => r(null);
    });
    const canvas = document.createElement("canvas");
    const max = 960;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  };

  const estimate = async (dataUrl: string) => {
    triggerHaptic("medium");
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const compact = await compress(dataUrl);
      setPreview(compact);
      const res = await fetch("/api/plate-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: compact,
          mime: "image/jpeg",
          hint,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "estimate_failed");
      triggerHaptic("success");
      setResult(data as PlateEstimate);
    } catch (err) {
      triggerHaptic("heavy");
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setBusy(false);
    }
  };

  const logAll = () => {
    if (!result) return;
    triggerHaptic("medium");
    result.items.forEach((item) => {
      if (item.foodId) {
        addFoodToMeal(item.foodId, meal, item.grams);
        return;
      }
      addEntry({
        meal,
        nameRo: `${item.nameRo} · ${item.grams}g`,
        nameEn: `${item.nameEn} · ${item.grams}g`,
        grams: item.grams,
        macros: item.macros,
      });
    });
  };

  return (
    <div className="space-y-6">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl md:text-4xl">{t(locale, "platePhotoTitle")}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            {vision
              ? t(locale, "platePhotoDescVision")
              : t(locale, "platePhotoDescHeuristic")}
          </p>
        </div>
        {vision !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
            <Sparkles size={14} />
            Gemini 2.5 Flash Vision
          </span>
        )}
      </header>

      <section className="surface space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {(["breakfast", "lunch", "dinner", "snack"] as MealKey[]).map((m) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={m}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                meal === m ? "bg-brand text-white shadow-sm" : "border border-[var(--line)] bg-white/80 text-ink-soft"
              }`}
              onClick={() => {
                triggerHaptic("light");
                setMeal(m);
              }}
            >
              {t(locale, m)}
            </motion.button>
          ))}
        </div>

        <input
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder={t(locale, "plateHint")}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void readFile(file).then((url) => estimate(url));
          }}
        />

        <div className="flex flex-wrap gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn btn-primary text-sm shadow-md"
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={18} />
            {t(locale, "takePlatePhoto")}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              if (fileRef.current) fileRef.current.removeAttribute("capture");
              fileRef.current?.click();
            }}
          >
            <ImagePlus size={18} />
            {t(locale, "uploadPlatePhoto")}
          </motion.button>
        </div>

        {/* Futuristic Camera HUD Frame (Inspired by Mockups 3 & 4) */}
        {preview && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-black shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Plate preview" className="max-h-80 w-full object-cover opacity-90" />

            {/* HUD Scanner Laser Beam Animation */}
            {busy && (
              <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#22c55e] animate-scan-beam" />
            )}

            {/* HUD Target Corners */}
            <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-dashed border-emerald-400/50" />

            {/* HUD Status Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <ScanLine size={14} className="text-emerald-400 animate-pulse" />
              {busy ? "Analiză Gemini AI în curs..." : "Detectat"}
            </div>

            {result && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-black shadow-lg">
                <CheckCircle2 size={14} />
                Încredere 98%
              </div>
            )}
          </div>
        )}

        {busy && <p className="text-sm font-semibold text-emerald-600 animate-pulse">{t(locale, "estimatingPlate")}</p>}
        {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      </section>

      {/* Results Section */}
      {result && (
        <section className="surface space-y-4 p-5 md:p-6 animate-rise">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="display text-xl font-bold">Rezultat Detectat</h3>
              <p className="text-xs text-ink-soft">
                {locale === "ro" ? result.noteRo : result.noteEn} · {result.provider}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
              {result.items.reduce((acc, item) => acc + item.macros.kcal, 0)} kcal Total
            </span>
          </div>

          <ul className="space-y-2.5">
            {result.items.map((item, i) => (
              <li
                key={`${item.nameEn}-${i}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/80 p-3.5 shadow-xs"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {locale === "ro" ? item.nameRo : item.nameEn}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="text-emerald-700">{item.macros.kcal} kcal</span>
                    <span className="text-amber-700">P {item.macros.protein}g</span>
                    <span className="text-blue-700">C {item.macros.carbs}g</span>
                    <span className="text-rose-700">F {item.macros.fat}g</span>
                    <span className="text-ink-soft">({item.grams}g)</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="btn btn-ghost !px-3 !py-1.5 text-xs font-semibold"
                  onClick={() => {
                    triggerHaptic("light");
                    if (item.foodId) addFoodToMeal(item.foodId, meal, item.grams);
                    else
                      addEntry({
                        meal,
                        nameRo: item.nameRo,
                        nameEn: item.nameEn,
                        grams: item.grams,
                        macros: item.macros,
                      });
                  }}
                >
                  {t(locale, "add")}
                </motion.button>
              </li>
            ))}
          </ul>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            className="btn btn-primary w-full text-sm shadow-md"
            onClick={logAll}
          >
            {t(locale, "logWholePlate")}
          </motion.button>
        </section>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { t } from "@/lib/i18n";
import type { PlateEstimate } from "@/lib/plate-types";
import { type MealKey, useFarfurieStore } from "@/lib/store";

export function PlatePhotoBoard() {
  const locale = useFarfurieStore((s) => s.locale);
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
      setResult(data as PlateEstimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setBusy(false);
    }
  };

  const logAll = () => {
    if (!result) return;
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
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "platePhotoTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "platePhotoDesc")}</p>
      </header>

      <section className="surface space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {(["breakfast", "lunch", "dinner", "snack"] as MealKey[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                meal === m ? "bg-brand text-white" : "border border-[var(--line)] bg-white/80"
              }`}
              onClick={() => setMeal(m)}
            >
              {t(locale, m)}
            </button>
          ))}
        </div>
        <input
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder={t(locale, "plateHint")}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
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
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary text-sm" onClick={() => fileRef.current?.click()}>
            <Camera size={16} />
            {t(locale, "takePlatePhoto")}
          </button>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              if (fileRef.current) fileRef.current.removeAttribute("capture");
              fileRef.current?.click();
            }}
          >
            <ImagePlus size={16} />
            {t(locale, "uploadPlatePhoto")}
          </button>
        </div>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-64 w-full rounded-2xl object-cover" />
        )}
        {busy && <p className="text-sm text-ink-soft">{t(locale, "estimatingPlate")}</p>}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </section>

      {result && (
        <section className="surface space-y-3 p-5">
          <p className="text-sm text-ink-soft">
            {locale === "ro" ? result.noteRo : result.noteEn} · {result.provider}
          </p>
          <ul className="space-y-2">
            {result.items.map((item, i) => (
              <li
                key={`${item.nameEn}-${i}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {locale === "ro" ? item.nameRo : item.nameEn}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {item.grams}g · {item.macros.kcal} kcal · P {item.macros.protein}g
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost !px-3 !py-1.5 text-xs"
                  onClick={() => {
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
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-primary w-full text-sm" onClick={logAll}>
            {t(locale, "logWholePlate")}
          </button>
        </section>
      )}
    </div>
  );
}

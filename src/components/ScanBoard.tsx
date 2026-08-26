"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ScanBarcode } from "lucide-react";
import { DEMO_BARCODES } from "@/lib/barcodes";
import { foodName, foodUnit, macrosForGrams } from "@/lib/foods";
import { t } from "@/lib/i18n";
import { lookupBarcodeLive, searchFoodsLive } from "@/lib/off-client";
import { type MealKey, useFarfurieStore } from "@/lib/store";

type DetectorCtor = new (opts?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
};

export function ScanBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const addFoodToMeal = useFarfurieStore((s) => s.addFoodToMeal);
  const addCatalogFood = useFarfurieStore((s) => s.addCatalogFood);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveHits, setLiveHits] = useState<Awaited<ReturnType<typeof searchFoodsLive>>>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [meal, setMeal] = useState<MealKey>("snack");
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const apply = async (raw: string, add = false) => {
    setLoading(true);
    setMsg("");
    try {
      const food = await lookupBarcodeLive(raw);
      if (!food) {
        setMsg(t(locale, "notFoundBarcode"));
        return;
      }
      addCatalogFood(food);
      setMsg(
        `${foodName(food, locale)}${food.brand ? ` · ${food.brand}` : ""}${
          food.id.startsWith("off-") ? " · Open Food Facts" : ""
        }`,
      );
      if (add) addFoodToMeal(food.id, meal, food.defaultGrams);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const startCamera = async () => {
    setMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
      const Detector = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
      if (!Detector) {
        setMsg(t(locale, "cameraDenied"));
        return;
      }
      const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a"] });
      const loop = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => void loop());
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes[0]?.rawValue;
          if (value) {
            await apply(value, true);
            stopCamera();
            return;
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(() => void loop());
      };
      void loop();
    } catch {
      setMsg(t(locale, "cameraDenied"));
    }
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    const q = manual.trim();
    if (q.length < 3 || /^\d+$/.test(q)) {
      setLiveHits([]);
      return;
    }
    const id = window.setTimeout(() => {
      void searchFoodsLive(q).then(setLiveHits);
    }, 350);
    return () => window.clearTimeout(id);
  }, [manual]);

  const liveLabel = useMemo(
    () => (locale === "ro" ? "Open Food Facts live" : "Open Food Facts live"),
    [locale],
  );

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "scanTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "scanDesc")}</p>
        <p className="mt-1 text-xs text-ink-soft">{t(locale, "offLiveHint")}</p>
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
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void apply(manual, true);
          }}
        >
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2">
            <ScanBarcode size={16} className="text-brand" />
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder={t(locale, "barcodeOrSearch")}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <button type="submit" className="btn btn-primary text-sm" disabled={loading}>
            {loading ? "…" : t(locale, "add")}
          </button>
        </form>
        {msg && <p className="text-sm font-semibold text-brand">{msg}</p>}
        {liveHits.length > 0 && (
          <ul className="space-y-2">
            <li className="text-xs font-semibold uppercase text-ink-soft">{liveLabel}</li>
            {liveHits.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-2 text-left"
                  onClick={() => {
                    addCatalogFood(food);
                    addFoodToMeal(food.id, meal, food.defaultGrams);
                    setMsg(`${foodName(food, locale)} · Open Food Facts`);
                    setLiveHits([]);
                  }}
                >
                  <span className="text-sm font-semibold">
                    {foodName(food, locale)}
                    {food.brand ? <span className="text-ink-soft"> · {food.brand}</span> : null}
                  </span>
                  <span className="text-sm text-brand">
                    {macrosForGrams(food, food.defaultGrams).kcal} kcal
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <video
          ref={videoRef}
          className={`w-full rounded-2xl bg-black/80 ${cameraOn ? "aspect-video" : "hidden"}`}
          muted
          playsInline
        />
        <button
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => (cameraOn ? stopCamera() : void startCamera())}
        >
          <Camera size={16} />
          {cameraOn ? t(locale, "stopCamera") : t(locale, "startCamera")}
        </button>
      </section>

      <section className="surface p-5">
        <h2 className="display text-2xl">{t(locale, "demoEans")}</h2>
        <p className="mt-1 text-xs text-ink-soft">{t(locale, "offLiveTry")}</p>
        <ul className="mt-3 space-y-2">
          <li>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-3 text-left"
              onClick={() => {
                setManual("3017620422003");
                void apply("3017620422003", true);
              }}
            >
              <div>
                <p className="text-sm font-semibold">Nutella · Ferrero</p>
                <p className="text-xs text-ink-soft">3017620422003 · Open Food Facts</p>
              </div>
              <span className="text-sm font-semibold text-brand">live</span>
            </button>
          </li>
          {DEMO_BARCODES.filter((row) => row.food).map(({ ean, food }) => {
            if (!food) return null;
            const macros = macrosForGrams(food, food.defaultGrams);
            return (
              <li key={ean}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-3 text-left hover:border-brand/40"
                  onClick={() => {
                    setManual(ean);
                    void apply(ean, true);
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold">{foodName(food, locale)}</p>
                    <p className="text-xs text-ink-soft">
                      {ean} · {foodUnit(food, locale)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand">{macros.kcal} kcal</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

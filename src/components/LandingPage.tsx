"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Cloud,
  Gauge,
  PartyPopper,
  ScanBarcode,
  ShoppingBasket,
  Sparkles,
  Soup,
  UtensilsCrossed,
  Moon,
  Bot,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const features = [
  { key: "featureCoach", text: "featureCoachText", icon: Bot },
  { key: "featureScan", text: "featureScanText", icon: ScanBarcode },
  { key: "featureStores", text: "featureStoresText", icon: CalendarDays },
  { key: "featurePortions", text: "featurePortionsText", icon: UtensilsCrossed },
  { key: "featureFill", text: "featureFillText", icon: Sparkles },
  { key: "featurePot", text: "featurePotText", icon: Soup },
  { key: "featureMarket", text: "featureMarketText", icon: ShoppingBasket },
  { key: "featureHoliday", text: "featureHolidayText", icon: PartyPopper },
  { key: "featureAccount", text: "featureAccountText", icon: Cloud },
] as const;

export function LandingPage() {
  const locale = useFarfurieStore((s) => s.locale);
  const setLocale = useFarfurieStore((s) => s.setLocale);

  return (
    <div className="overflow-x-hidden bg-[#fafcf9]">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-shell items-center justify-between px-4 py-5 md:px-6">
          <p className="display text-2xl font-bold text-white drop-shadow-md md:text-3xl">Farfurie</p>
          <div className="flex overflow-hidden rounded-full border border-white/30 bg-black/30 text-xs font-semibold text-white backdrop-blur-md">
            <button
              type="button"
              className={`px-3.5 py-1.5 transition-colors ${locale === "ro" ? "bg-white text-black" : "hover:bg-white/10"}`}
              onClick={() => setLocale("ro")}
            >
              RO
            </button>
            <button
              type="button"
              className={`px-3.5 py-1.5 transition-colors ${locale === "en" ? "bg-white text-black" : "hover:bg-white/10"}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=2000&q=80)",
          }}
        />
        {/* Dark gradient overlay for max contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-shell items-center px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-2xl"
          >
            {/* Glassmorphism Hero Box Level Up Style */}
            <div className="rounded-[2.5rem] border border-white/20 bg-black/60 p-6 md:p-10 shadow-2xl backdrop-blur-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f13a30]/40 bg-[#f13a30]/15 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-[#f13a30] uppercase">
                <Sparkles size={12} />
                <span>DATA-DRIVEN NUTRITION COACHING</span>
              </div>
              <p className="display text-4xl leading-[0.95] text-white md:text-6xl font-extrabold tracking-tight uppercase">
                Mănâncă cu scop.<br />
                <em className="not-italic text-[#55dc88]">Progresează cu dovezi.</em>
              </p>
              <h1 className="mt-3 display text-lg font-medium text-zinc-300 md:text-2xl">
                {t(locale, "tagline")}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
                {t(locale, "heroSupport")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/app" className="btn btn-primary bg-[#55dc88] text-black hover:bg-[#42c573] font-extrabold px-7 py-3.5 text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                    {t(locale, "ctaStart")} <span>↗</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <a href="#diferente" className="btn btn-ghost border-white/30 text-white hover:bg-white/10 px-6 py-3.5 text-sm uppercase tracking-wider font-bold">
                    {t(locale, "ctaDemo")} <span>↓</span>
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Floating Card Level Up Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="pointer-events-none absolute right-6 top-1/2 hidden w-80 -translate-y-1/2 rounded-[2rem] border border-white/20 bg-[#0e1012]/90 p-5 text-white shadow-2xl backdrop-blur-md lg:block"
          >
            <div className="flex items-center justify-between">
              <p className="level-kicker text-[#f13a30]">FARFURIE GUIDANCE</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono text-zinc-400">AI REAL-TIME</span>
            </div>
            <p className="mt-2 display text-3xl font-extrabold">312 kcal</p>
            <p className="mt-0.5 text-xs text-zinc-400 font-medium">+ 28g proteină de acoperit azi</p>
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
              Salată cu ton și ou · 310 kcal · P 32g
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="mx-auto max-w-shell px-4 py-16 md:px-6 md:py-24" id="diferente">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="display text-3xl font-bold md:text-5xl text-gray-900"
        >
          {t(locale, "uniqueTitle")}
        </motion.h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ key, text, icon: Icon }, i) => (
            <motion.article
              key={key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-[1.8rem] border border-gray-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Icon size={22} />
              </div>
              <h3 className="display text-xl font-bold text-gray-900">{t(locale, key)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(locale, text)}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Mission & Brand Section */}
      <section className="border-y border-gray-200 bg-emerald-900 py-16 text-white">
        <div className="mx-auto max-w-shell px-4 md:px-6">
          <div className="max-w-3xl">
            <h2 className="display text-3xl font-bold md:text-4xl text-emerald-300">
              {t(locale, "missionTitle")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/90 md:text-lg">
              {t(locale, "missionText")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm">
                <ShieldCheck size={18} className="text-emerald-400" />
                Confidențialitate & Cloud Sync
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm">
                <FileCheck2 size={18} className="text-emerald-400" />
                Export Rapoarte PDF
              </div>
            </div>
            <div className="mt-8">
              <Link href="/app" className="btn btn-primary bg-emerald-400 text-black hover:bg-emerald-300 font-semibold px-6 py-3 text-base">
                {t(locale, "ctaStart")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-shell px-4 py-10 text-sm text-gray-500 md:px-6">
        <p className="display text-2xl font-bold text-emerald-800">Farfurie</p>
        <p className="mt-2 text-xs">{t(locale, "footerNote")}</p>
      </footer>
    </div>
  );
}

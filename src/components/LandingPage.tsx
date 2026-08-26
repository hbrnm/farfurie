"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  PartyPopper,
  ShoppingBasket,
  Sparkles,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const features = [
  { key: "featureFill", text: "featureFillText", icon: Sparkles },
  { key: "featurePot", text: "featurePotText", icon: Soup },
  { key: "featureMarket", text: "featureMarketText", icon: ShoppingBasket },
  { key: "featureHoliday", text: "featureHolidayText", icon: PartyPopper },
  { key: "featurePortions", text: "featurePortionsText", icon: UtensilsCrossed },
  { key: "featureStores", text: "featureStoresText", icon: CalendarDays },
] as const;

export function LandingPage() {
  const locale = useFarfurieStore((s) => s.locale);
  const setLocale = useFarfurieStore((s) => s.setLocale);

  return (
    <div className="overflow-x-hidden">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-shell items-center justify-between px-4 py-5 md:px-6">
          <p className="display text-2xl text-white drop-shadow md:text-3xl">Farfurie</p>
          <div className="flex overflow-hidden rounded-full border border-white/30 bg-black/20 text-xs font-semibold text-white backdrop-blur">
            <button
              type="button"
              className={`px-3 py-1.5 ${locale === "ro" ? "bg-white text-ink" : ""}`}
              onClick={() => setLocale("ro")}
            >
              RO
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 ${locale === "en" ? "bg-white text-ink" : ""}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=2000&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f241c]/92 via-[#163528]/72 to-[#1b5e45]/35" />
        <div className="absolute inset-0 hero-grain opacity-30" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-shell flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:px-6 md:pb-24 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl text-white"
          >
            <p className="display text-5xl leading-[0.95] md:text-7xl">Farfurie</p>
            <h1 className="mt-4 display text-2xl font-normal text-accent-soft md:text-4xl">
              {t(locale, "tagline")}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
              {t(locale, "heroSupport")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="btn btn-primary bg-accent text-ink hover:bg-accent-soft">
                {t(locale, "ctaStart")}
              </Link>
              <a href="#diferente" className="btn btn-ghost border-white/30 text-white">
                {t(locale, "ctaDemo")}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="pointer-events-none absolute right-6 top-1/2 hidden w-72 -translate-y-1/2 rounded-[2rem] border border-white/25 bg-white/15 p-4 text-white shadow-2xl backdrop-blur-md animate-float lg:block"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">Umple golul</p>
            <p className="mt-2 display text-2xl">312 kcal rămase</p>
            <p className="mt-1 text-sm text-white/80">+ 28g proteină de acoperit</p>
            <div className="mt-4 rounded-2xl bg-black/25 p-3 text-sm">
              Salată cu ton Scandia · 310 kcal · P 32g
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 py-16 md:px-6 md:py-24" id="diferente">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="display text-3xl md:text-5xl"
        >
          {t(locale, "uniqueTitle")}
        </motion.h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ key, text, icon: Icon }, i) => (
            <motion.article
              key={key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[1.5rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,white)] p-5 shadow-[var(--shadow)]"
            >
              <div className="mb-3 inline-flex rounded-2xl bg-brand/10 p-2.5 text-brand">
                <Icon size={20} />
              </div>
              <h3 className="display text-xl">{t(locale, key)}</h3>
              <p className="mt-2 text-sm text-ink-soft">{t(locale, text)}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/40 py-16">
        <div className="mx-auto max-w-shell px-4 md:px-6">
          <h2 className="display text-3xl md:text-4xl">{t(locale, "whyTitle")}</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {(
              ["fromFit", "fromEat", "fromYazio", "fromMfp"] as const
            ).map((key) => (
              <li
                key={key}
                className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-ink-soft"
              >
                {t(locale, key)}
              </li>
            ))}
          </ul>
          <Link href="/app" className="btn btn-primary mt-8">
            {t(locale, "ctaStart")}
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-shell px-4 py-10 text-sm text-ink-soft md:px-6">
        <p className="display text-xl text-brand">Farfurie</p>
        <p className="mt-2">{t(locale, "footerNote")}</p>
      </footer>
    </div>
  );
}

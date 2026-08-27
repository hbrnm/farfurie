"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarRange,
  Camera,
  Home,
  LineChart,
  MoreHorizontal,
  ScanBarcode,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { triggerHaptic } from "@/lib/haptics";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const links = [
  { href: "/app", key: "navDiary" as const, icon: Home },
  { href: "/app/plan", key: "navPlan" as const, icon: Utensils },
  { href: "/app/recipes", key: "navRecipes" as const, icon: BookOpen },
  { href: "/app/insights", key: "navInsights" as const, icon: LineChart },
  { href: "/app/profile", key: "navProfile" as const, icon: UserRound },
];

const moreLinks = [
  { href: "/app/scan", key: "navScan" as const },
  { href: "/app/program", key: "navProgram" as const },
  { href: "/app/plate", key: "navPlate" as const },
  { href: "/app/coach", key: "navCoach" as const },
  { href: "/app/builder", key: "navBuilder" as const },
  { href: "/app/compare", key: "navCompare" as const },
  { href: "/app/account", key: "navAccount" as const },
  { href: "/app/market", key: "navMarket" as const },
  { href: "/app/pot", key: "navPot" as const },
  { href: "/app/list", key: "navList" as const },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <AppShellInner>{children}</AppShellInner>
    </ClientOnly>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useFarfurieStore((s) => s.locale);
  const setLocale = useFarfurieStore((s) => s.setLocale);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const toggleHoliday = useFarfurieStore((s) => s.toggleHoliday);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <OnboardingWizard />
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="display text-2xl text-brand font-bold">
            Farfurie
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, key, icon: Icon }) => {
              const active =
                href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "text-ink-soft hover:bg-white/70"
                  }`}
                >
                  <Icon size={16} />
                  {t(locale, key)}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/app/scan"
              className="hidden rounded-full border border-[var(--line)] bg-white/70 p-2 text-ink-soft hover:bg-white sm:inline-flex"
              aria-label={t(locale, "navScan")}
            >
              <ScanBarcode size={16} />
            </Link>
            <button
              type="button"
              onClick={toggleHoliday}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                holidayMode
                  ? "bg-accent text-ink"
                  : "bg-white/70 text-ink-soft border border-[var(--line)]"
              }`}
              title={holidayMode ? t(locale, "holidaysOn") : t(locale, "holidaysOff")}
            >
              {t(locale, "holidays")}
            </button>
            <div className="flex overflow-hidden rounded-full border border-[var(--line)] bg-white/70 text-xs font-semibold">
              <button
                type="button"
                className={`px-2.5 py-1.5 ${locale === "ro" ? "bg-brand text-white" : ""}`}
                onClick={() => setLocale("ro")}
              >
                RO
              </button>
              <button
                type="button"
                className={`px-2.5 py-1.5 ${locale === "en" ? "bg-brand text-white" : ""}`}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] bg-white/70 p-2 text-ink-soft md:hidden"
              onClick={() => setMoreOpen(true)}
              aria-label={t(locale, "navMore")}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-shell px-4 py-6 md:px-6 md:py-8">{children}</main>

      {/* Floating Mobile PWA Nav Bar (Inspired by Mockup 2) */}
      <nav className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md md:hidden">
        <div className="flex items-center justify-between rounded-full border border-white/20 bg-gray-950/90 p-2 shadow-2xl backdrop-blur-xl">
          {/* Home */}
          <Link
            href="/app"
            onClick={() => triggerHaptic("light")}
            className={`flex flex-1 flex-col items-center py-1 text-[11px] font-semibold transition-colors ${
              pathname === "/app" ? "text-emerald-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <Home size={20} />
            <span className="mt-0.5">Acasă</span>
          </Link>

          {/* Meals */}
          <Link
            href="/app/plan"
            onClick={() => triggerHaptic("light")}
            className={`flex flex-1 flex-col items-center py-1 text-[11px] font-semibold transition-colors ${
              pathname.startsWith("/app/plan") ? "text-emerald-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <Utensils size={20} />
            <span className="mt-0.5">Mese</span>
          </Link>

          {/* Glowing Green Floating Camera Button (Mockup 2 Center Button) */}
          <Link href="/app/plate" onClick={() => triggerHaptic("medium")}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            >
              <Camera size={24} className="stroke-[2.5]" />
            </motion.div>
          </Link>

          {/* Progress */}
          <Link
            href="/app/insights"
            onClick={() => triggerHaptic("light")}
            className={`flex flex-1 flex-col items-center py-1 text-[11px] font-semibold transition-colors ${
              pathname.startsWith("/app/insights") ? "text-emerald-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <LineChart size={20} />
            <span className="mt-0.5">Progres</span>
          </Link>

          {/* Profile */}
          <Link
            href="/app/profile"
            onClick={() => triggerHaptic("light")}
            className={`flex flex-1 flex-col items-center py-1 text-[11px] font-semibold transition-colors ${
              pathname.startsWith("/app/profile") ? "text-emerald-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <UserRound size={20} />
            <span className="mt-0.5">Profil</span>
          </Link>
        </div>
      </nav>

      {/* More Sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 surface rounded-t-3xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="display text-xl">{t(locale, "moreTitle")}</h2>
              <button type="button" className="rounded-full p-2" onClick={() => setMoreOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-[var(--line)] bg-white/70 px-3 py-3 text-sm font-semibold"
                  onClick={() => setMoreOpen(false)}
                >
                  {t(locale, item.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

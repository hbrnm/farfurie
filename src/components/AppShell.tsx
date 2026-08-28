"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  Calendar,
  Camera,
  ChartLine,
  Flame,
  Home,
  Moon,
  ShoppingBag,
  ShoppingCart,
  Sun,
  Soup,
  UserRound,
  ScanBarcode,
} from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { triggerHaptic } from "@/lib/haptics";
import { useFarfurieStore } from "@/lib/store";

const mainNavLinks = [
  { href: "/app", labelRo: "Jurnal", labelEn: "Diary", icon: Home },
  { href: "/app/recipes", labelRo: "Rețete", labelEn: "Recipes", icon: BookOpen },
  { href: "/app/insights", labelRo: "Progres", labelEn: "Progress", icon: ChartLine },
  { href: "/app/coach", labelRo: "Antrenor AI", labelEn: "AI Coach", icon: Bot },
  { href: "/app/profile", labelRo: "Profil", labelEn: "Profile", icon: UserRound },
];

const secondaryNavLinks = [
  { href: "/app/pot", labelRo: "Oala Comună", labelEn: "Family Pot", icon: Soup },
  { href: "/app/plan", labelRo: "Plan săptămânal", labelEn: "Meal Plan", icon: Calendar },
  { href: "/app/list", labelRo: "Cumpărături", labelEn: "Shopping List", icon: ShoppingCart },
  { href: "/app/market", labelRo: "Piață & Preț", labelEn: "Market & Prices", icon: ShoppingBag },
  { href: "/app/scan", labelRo: "Scaner Coduri", labelEn: "Barcode Scan", icon: ScanBarcode },
  { href: "/app/plate", labelRo: "Foto Farfurie", labelEn: "Plate Vision", icon: Camera },
];

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
  const theme = useFarfurieStore((s) => s.theme);
  const toggleTheme = useFarfurieStore((s) => s.toggleTheme);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const toggleHoliday = useFarfurieStore((s) => s.toggleHoliday);

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[var(--bg)] transition-colors duration-200">
      <OnboardingWizard />

      {/* Header Unificat Modern Level Up Style */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur-md dark:bg-[#070707]/90 transition-colors">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={() => triggerHaptic("light")}
              className="group flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 dark:bg-[#f13a30] text-white shadow-md transition-all group-hover:shadow-emerald-500/20 dark:group-hover:shadow-rose-500/30 -skew-x-6">
                <span className="font-black text-xs tracking-wider">F</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="display text-base font-extrabold tracking-wider text-gray-900 dark:text-white uppercase">
                  FARFURIE
                </span>
                <span className="level-kicker text-[9px] text-emerald-600 dark:text-[#f13a30] tracking-[0.18em]">
                  NUTRITION & CALORIES
                </span>
              </div>
            </Link>

            {/* Mod Sărbători Indicator Badge */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                toggleHoliday();
              }}
              title={holidayMode ? "Mod Sărbători Activ (+15% Buget)" : "Activează Mod Sărbători"}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                holidayMode
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-sm"
                  : "bg-gray-100 text-gray-500 dark:bg-zinc-900 dark:text-zinc-400 border border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <Flame size={13} className={holidayMode ? "animate-pulse text-amber-500" : ""} />
              <span>{holidayMode ? "Sărbători (+15%)" : "Mod Sărbători"}</span>
            </button>
          </div>

          {/* Desktop Primary Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {mainNavLinks.map(({ href, labelRo, labelEn, icon: Icon }) => {
              const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => triggerHaptic("light")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={15} />
                  {locale === "ro" ? labelRo : labelEn}
                </Link>
              );
            })}
          </nav>

          {/* Controls: Theme & Language */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            <div className="flex overflow-hidden rounded-full border border-gray-200 text-xs font-semibold dark:border-gray-700">
              <button
                type="button"
                className={`px-2.5 py-1 transition-colors ${
                  locale === "ro"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
                onClick={() => setLocale("ro")}
              >
                RO
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 transition-colors ${
                  locale === "en"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Scrollable Quick-Feature Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#101519]/70 backdrop-blur-sm overflow-x-auto no-scrollbar">
          <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-1.5 text-xs font-medium">
            {secondaryNavLinks.map(({ href, labelRo, labelEn, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => triggerHaptic("light")}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
                    active
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                      : "text-gray-600 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={13} />
                  <span>{locale === "ro" ? labelRo : labelEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      {/* Modern Floating Bottom Navigation Bar for Mobile */}
      <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md md:hidden">
        <div className="flex items-center justify-around rounded-3xl border border-gray-200/80 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/90">
          {mainNavLinks.map(({ href, labelRo, labelEn, icon: Icon }) => {
            const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => triggerHaptic("light")}
                className={`flex flex-col items-center px-3 py-1 text-[10px] font-semibold transition-colors ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                <Icon size={19} />
                <span className="mt-0.5">{locale === "ro" ? labelRo : labelEn}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}


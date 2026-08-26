"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Home,
  ShoppingBasket,
  UserRound,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const links = [
  { href: "/app", key: "navDiary" as const, icon: Home },
  { href: "/app/recipes", key: "navRecipes" as const, icon: BookOpen },
  { href: "/app/list", key: "navList" as const, icon: ClipboardList },
  { href: "/app/market", key: "navMarket" as const, icon: ShoppingBasket },
  { href: "/app/profile", key: "navProfile" as const, icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useFarfurieStore((s) => s.locale);
  const setLocale = useFarfurieStore((s) => s.setLocale);
  const holidayMode = useFarfurieStore((s) => s.holidayMode);
  const toggleHoliday = useFarfurieStore((s) => s.toggleHoliday);

  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="display text-2xl text-brand">
            Farfurie
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, key, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand text-white"
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-shell px-4 py-6 md:px-6 md:py-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-shell grid-cols-5 gap-1 px-2 py-2">
          {links.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold ${
                  active ? "bg-brand text-white" : "text-ink-soft"
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{t(locale, key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Home, UserRound } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { triggerHaptic } from "@/lib/haptics";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

const links = [
  { href: "/app", label: "Jurnal", icon: Home },
  { href: "/app/plate", label: "Farfurie AI", icon: Camera },
  { href: "/app/profile", label: "Profil", icon: UserRound },
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

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-[var(--bg)]">
      <OnboardingWizard />

      {/* Clean Ultra-Minimal Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/80 backdrop-blur-md dark:bg-[#141a1f]/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Farfurie
          </Link>

          {/* Desktop Navigation (3 Clean Tabs) */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => triggerHaptic("light")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <div className="flex overflow-hidden rounded-full border border-gray-200 text-xs font-semibold dark:border-gray-700">
            <button
              type="button"
              className={`px-2.5 py-1 transition-colors ${locale === "ro" ? "bg-emerald-600 text-white" : "text-gray-600 dark:text-gray-400"}`}
              onClick={() => setLocale("ro")}
            >
              RO
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 transition-colors ${locale === "en" ? "bg-emerald-600 text-white" : "text-gray-600 dark:text-gray-400"}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>

      {/* Minimal Floating Bottom Bar for Mobile (3 Core Tabs) */}
      <nav className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm md:hidden">
        <div className="flex items-center justify-around rounded-full border border-gray-200 bg-white/90 p-2 shadow-lg backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => triggerHaptic("light")}
                className={`flex flex-col items-center px-4 py-1.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                <Icon size={20} />
                <span className="mt-0.5">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useFarfurieStore } from "@/lib/store";

type Me = { email: string | null; id?: string };

export function AccountBoard() {
  const locale = useFarfurieStore((s) => s.locale);
  const exportSnapshot = useFarfurieStore((s) => s.exportSnapshot);
  const importSnapshot = useFarfurieStore((s) => s.importSnapshot);
  const [me, setMe] = useState<Me | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/auth/me");
    const data = (await res.json()) as Me;
    setMe(data);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setStatus("");
    try {
      await fn();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "error");
    } finally {
      setBusy(false);
    }
  };

  const register = () =>
    run(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "register_failed"));
      setMe({ email: data.email, id: data.id });
      setStatus(t(locale, "accountReady"));
    });

  const login = () =>
    run(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "login_failed"));
      setMe({ email: data.email, id: data.id });
      setStatus(t(locale, "accountReady"));
    });

  const logout = () =>
    run(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setMe({ email: null });
      setStatus("");
    });

  const push = () =>
    run(async () => {
      const res = await fetch("/api/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: exportSnapshot() }),
      });
      if (!res.ok) throw new Error("sync_push_failed");
      setStatus(t(locale, "syncPushed"));
    });

  const pull = () =>
    run(async () => {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!res.ok) throw new Error("sync_pull_failed");
      if (!data.snapshot) {
        setStatus(t(locale, "syncEmpty"));
        return;
      }
      importSnapshot(data.snapshot);
      setStatus(t(locale, "syncPulled"));
    });

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="display text-3xl md:text-4xl">{t(locale, "accountTitle")}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t(locale, "accountDesc")}</p>
      </header>

      {me?.email ? (
        <section className="surface space-y-4 p-5">
          <p className="text-sm">
            {t(locale, "signedInAs")} <span className="font-semibold">{me.email}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary text-sm" disabled={busy} onClick={() => void push()}>
              {t(locale, "syncPush")}
            </button>
            <button type="button" className="btn btn-ghost text-sm" disabled={busy} onClick={() => void pull()}>
              {t(locale, "syncPull")}
            </button>
            <button type="button" className="btn btn-ghost text-sm" disabled={busy} onClick={() => void logout()}>
              {t(locale, "signOut")}
            </button>
          </div>
        </section>
      ) : (
        <form
          className="surface space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t(locale, "password")}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            autoComplete="current-password"
            minLength={8}
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary text-sm" disabled={busy}>
              {t(locale, "signIn")}
            </button>
            <button type="button" className="btn btn-ghost text-sm" disabled={busy} onClick={() => void register()}>
              {t(locale, "register")}
            </button>
          </div>
        </form>
      )}

      {status && <p className="text-sm font-semibold text-brand">{status}</p>}
    </div>
  );
}

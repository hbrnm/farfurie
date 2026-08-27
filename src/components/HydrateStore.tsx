"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFarfurieStore } from "@/lib/store";

export function HydrateStore({ children }: { children: ReactNode }) {
  const isHydrated = useRef(false);

  useEffect(() => {
    void useFarfurieStore.persist.rehydrate();
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const unsubscribe = useFarfurieStore.subscribe((state) => {
      if (!isHydrated.current) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const meRes = await fetch("/api/auth/me");
          const me = (await meRes.json()) as { email?: string };
          if (me?.email) {
            await fetch("/api/sync", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ snapshot: state.exportSnapshot() }),
            });
          }
        } catch {
          // Silent background sync failure fallback for offline mode
        }
      }, 3000);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return children;
}

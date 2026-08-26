"use client";

import { useEffect, type ReactNode } from "react";
import { useFarfurieStore } from "@/lib/store";

/** Rehydrate persisted diary after mount so SSR HTML matches the first client render. */
export function HydrateStore({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useFarfurieStore.persist.rehydrate();
  }, []);
  return children;
}

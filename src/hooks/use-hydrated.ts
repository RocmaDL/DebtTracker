"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useApp } from "@/lib/store";

/** Réhydrate le store depuis le localStorage côté client uniquement (évite les écarts SSR). */
export function useHydrated() {
  const hydrated = useSyncExternalStore(
    (cb) => useApp.persist.onFinishHydration(cb),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
  useEffect(() => {
    if (!useApp.persist.hasHydrated()) void useApp.persist.rehydrate();
  }, []);
  return hydrated;
}

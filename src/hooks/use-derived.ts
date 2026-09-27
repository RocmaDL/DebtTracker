"use client";

import { useMemo } from "react";
import { addDays } from "@/lib/dates";
import { balanceAt, buildTimeline, computePlan } from "@/lib/engine";
import { computeStreaks, levelFor, totalXp, unlockedBadges } from "@/lib/gamification";
import { useApp } from "@/lib/store";
import { useToday } from "./use-today";

/** Toutes les données calculées de l'app, mémoïsées sur (entrées, réglages, jour). */
export function useDerived() {
  const entries = useApp((s) => s.entries);
  const settings = useApp((s) => s.settings);
  const todayDate = useToday();

  return useMemo(() => {
    const timeline = buildTimeline(entries, settings, todayDate);
    const debt = balanceAt(timeline, todayDate);
    const debtWeekAgo = balanceAt(timeline, addDays(todayDate, -7));
    const plan = computePlan(entries, settings, todayDate, debt);
    const streaks = computeStreaks(entries, settings, todayDate);
    const level = levelFor(totalXp(entries));
    const badges = unlockedBadges({ entries, timeline, streaks, level, today: todayDate });
    return { today: todayDate, entries, settings, timeline, debt, debtWeekAgo, plan, streaks, level, badges };
  }, [entries, settings, todayDate]);
}

export type Derived = ReturnType<typeof useDerived>;

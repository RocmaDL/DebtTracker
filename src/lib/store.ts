"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_SETTINGS } from "./catalog";
import { today } from "./dates";
import { DEMO_SETTINGS, generateDemo } from "./demo";
import { buildTimeline } from "./engine";
import { computeStreaks, levelFor, totalXp, unlockedBadges } from "./gamification";
import type { Activity, Entry, Settings } from "./types";

export type Mode = "demo" | "personal";

export interface TimerState {
  startedAt: number;
  activity: Activity;
  target: number;
}

interface PersistedState {
  onboarded: boolean;
  mode: Mode;
  settings: Settings;
  entries: Entry[];
  /** Badges déjà annoncés : évite de re-notifier au rechargement. */
  seenBadges: string[];
  timer: TimerState | null;
}

interface Actions {
  addEntry: (entry: Entry) => void;
  updateEntry: (entry: Entry) => void;
  removeEntry: (id: string) => Entry | undefined;
  updateSettings: (patch: Partial<Settings>) => void;
  loadDemo: () => void;
  startFresh: (settings: Settings) => void;
  replayOnboarding: () => void;
  markBadgesSeen: (ids: string[]) => void;
  startTimer: (activity: Activity, target: number) => void;
  cancelTimer: () => void;
  setTimerActivity: (activity: Activity) => void;
}

export type AppState = PersistedState & Actions;

const initial: PersistedState = {
  onboarded: false,
  mode: "demo",
  settings: DEFAULT_SETTINGS,
  entries: [],
  seenBadges: [],
  timer: null,
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      addEntry: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
      updateEntry: (entry) => set((s) => ({ entries: s.entries.map((e) => (e.id === entry.id ? entry : e)) })),
      removeEntry: (id) => {
        const removed = get().entries.find((e) => e.id === id);
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        return removed;
      },
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      loadDemo: () => {
        const entries = generateDemo(today());
        set({
          onboarded: true,
          mode: "demo",
          settings: DEMO_SETTINGS,
          entries,
          // Les badges déjà acquis par le jeu de démo ne sont pas « annoncés ».
          seenBadges: [...badgesFor(entries, DEMO_SETTINGS)],
          timer: null,
        });
      },
      startFresh: (settings) =>
        set({ onboarded: true, mode: "personal", settings, entries: [], seenBadges: [], timer: null }),
      replayOnboarding: () => set({ onboarded: false }),

      markBadgesSeen: (ids) => set((s) => ({ seenBadges: [...new Set([...s.seenBadges, ...ids])] })),

      startTimer: (activity, target) => set({ timer: { startedAt: Date.now(), activity, target } }),
      cancelTimer: () => set({ timer: null }),
      setTimerActivity: (activity) => set((s) => (s.timer ? { timer: { ...s.timer, activity } } : {})),
    }),
    {
      name: "debttracker:v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ onboarded, mode, settings, entries, seenBadges, timer }) => ({
        onboarded,
        mode,
        settings,
        entries,
        seenBadges,
        timer,
      }),
    },
  ),
);

/** Identifiant unique pour une nouvelle entrée. */
export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function badgesFor(entries: Entry[], settings: Settings) {
  const d = today();
  const timeline = buildTimeline(entries, settings, d);
  return unlockedBadges({
    entries,
    timeline,
    streaks: computeStreaks(entries, settings, d),
    level: levelFor(totalXp(entries)),
    today: d,
  });
}

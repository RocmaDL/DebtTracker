"use client";

import { create } from "zustand";
import type { Entry, ISODate } from "./types";

export type EntrySheet =
  | { type: "entry"; kind: "expense" | "session"; date?: ISODate; entry?: Entry }
  | { type: "day"; date: ISODate }
  | { type: "quick" };

interface UIState {
  sheet: EntrySheet | null;
  /** Incrémenté à chaque ouverture : sert de clé pour réinitialiser les formulaires. */
  openId: number;
  timerExpanded: boolean;
  open: (sheet: EntrySheet) => void;
  close: () => void;
  setTimerExpanded: (v: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  sheet: null,
  openId: 0,
  timerExpanded: true,
  open: (sheet) => set((s) => ({ sheet, openId: s.openId + 1 })),
  close: () => set({ sheet: null }),
  setTimerExpanded: (timerExpanded) => set({ timerExpanded }),
}));

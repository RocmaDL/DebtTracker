import { addDays, eachDay } from "./dates";
import { isExpense, isSession, scheduledSlots, sessionRepayment, type TimelinePoint } from "./engine";
import type { Entry, ISODate, Settings } from "./types";

/* ------------------------------------------------------------------ */
/*  XP & niveaux                                                       */
/* ------------------------------------------------------------------ */

/** 1 XP par minute de sport, les minutes de remboursement comptent double. */
export function totalXp(entries: Entry[]): number {
  return entries.filter(isSession).reduce((s, e) => s + e.duration + sessionRepayment(e), 0);
}

export const LEVELS = [
  { name: "Recrue", xp: 0 },
  { name: "Échauffé", xp: 300 },
  { name: "Régulier", xp: 900 },
  { name: "Athlète", xp: 1800 },
  { name: "Machine", xp: 3200 },
  { name: "Titan", xp: 5200 },
  { name: "Légende", xp: 8000 },
] as const;

export interface LevelInfo {
  level: number; // 1-based
  name: string;
  xp: number;
  floor: number;
  ceil: number | null;
  /** 0 → 1 dans le niveau courant. */
  progress: number;
}

export function levelFor(xp: number): LevelInfo {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const floor = LEVELS[i].xp;
  const ceil = i + 1 < LEVELS.length ? LEVELS[i + 1].xp : null;
  return {
    level: i + 1,
    name: LEVELS[i].name,
    xp,
    floor,
    ceil,
    progress: ceil === null ? 1 : (xp - floor) / (ceil - floor),
  };
}

/* ------------------------------------------------------------------ */
/*  Séries                                                             */
/* ------------------------------------------------------------------ */

export interface Streaks {
  current: number;
  best: number;
}

/**
 * Une série compte les séances *planifiées* honorées consécutivement.
 * Aujourd’hui ne casse pas la série tant que la journée n’est pas finie.
 */
export function computeStreaks(entries: Entry[], settings: Settings, todayDate: ISODate): Streaks {
  const sessions = entries.filter(isSession);
  if (sessions.length === 0) return { current: 0, best: 0 };
  const done = new Set(sessions.map((s) => s.date));
  const first = sessions.reduce((m, s) => (s.date < m ? s.date : m), sessions[0].date);
  const slots = scheduledSlots(first, todayDate, settings.schedule).filter(
    (s) => s.date < todayDate || done.has(s.date),
  );

  let best = 0;
  let run = 0;
  for (const s of slots) {
    run = done.has(s.date) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current: run, best };
}

/* ------------------------------------------------------------------ */
/*  Badges                                                             */
/* ------------------------------------------------------------------ */

export interface BadgeContext {
  entries: Entry[];
  timeline: TimelinePoint[];
  streaks: Streaks;
  level: LevelInfo;
  today: ISODate;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: "footprints" | "sparkles" | "flame" | "zap" | "timer" | "coins" | "repeat" | "hourglass" | "leaf" | "shuffle" | "crown";
  test: (ctx: BadgeContext) => boolean;
}

const sessionsOf = (c: BadgeContext) => c.entries.filter(isSession);

export const BADGES: Badge[] = [
  {
    id: "first-session",
    name: "Premier pas",
    description: "Enregistrer une première séance.",
    icon: "footprints",
    test: (c) => sessionsOf(c).length > 0,
  },
  {
    id: "debt-free",
    name: "Ardoise propre",
    description: "Ramener une dette à zéro.",
    icon: "sparkles",
    test: (c) => c.timeline.some((p, i) => i > 0 && p.balance === 0 && c.timeline[i - 1].balance > 0),
  },
  {
    id: "streak-5",
    name: "En rythme",
    description: "5 séances planifiées honorées d’affilée.",
    icon: "flame",
    test: (c) => c.streaks.best >= 5,
  },
  {
    id: "streak-12",
    name: "Inarrêtable",
    description: "12 séances planifiées honorées d’affilée.",
    icon: "zap",
    test: (c) => c.streaks.best >= 12,
  },
  {
    id: "marathon",
    name: "Marathonien",
    description: "Une séance de 90 minutes ou plus.",
    icon: "timer",
    test: (c) => sessionsOf(c).some((s) => s.duration >= 90),
  },
  {
    id: "repay-300",
    name: "Bon payeur",
    description: "Rembourser 300 minutes au total.",
    icon: "coins",
    test: (c) => c.timeline.reduce((s, p) => s + p.effectiveRepaid, 0) >= 300,
  },
  {
    id: "sessions-30",
    name: "Habitué",
    description: "Enregistrer 30 séances.",
    icon: "repeat",
    test: (c) => sessionsOf(c).length >= 30,
  },
  {
    id: "minutes-3000",
    name: "3 000 minutes",
    description: "Cumuler 3 000 minutes de sport.",
    icon: "hourglass",
    test: (c) => sessionsOf(c).reduce((s, e) => s + e.duration, 0) >= 3000,
  },
  {
    id: "clean-week",
    name: "Semaine clean",
    description: "7 jours sans fast-food avec au moins 2 séances.",
    icon: "leaf",
    test: hasCleanWeek,
  },
  {
    id: "versatile",
    name: "Polyvalent",
    description: "Pratiquer 3 activités différentes.",
    icon: "shuffle",
    test: (c) => new Set(sessionsOf(c).map((s) => s.activity)).size >= 3,
  },
  {
    id: "level-5",
    name: "Cinq étoiles",
    description: "Atteindre le niveau 5.",
    icon: "crown",
    test: (c) => c.level.level >= 5,
  },
];

function hasCleanWeek(c: BadgeContext): boolean {
  if (c.entries.length === 0) return false;
  const first = c.entries.reduce((m, e) => (e.date < m ? e.date : m), c.entries[0].date);
  const expenseDays = new Set(c.entries.filter(isExpense).map((e) => e.date));
  const sessionCount = new Map<ISODate, number>();
  for (const s of c.entries.filter(isSession)) sessionCount.set(s.date, (sessionCount.get(s.date) ?? 0) + 1);

  for (const start of eachDay(first, addDays(c.today, -6))) {
    const days = eachDay(start, addDays(start, 6));
    if (days.some((d) => expenseDays.has(d))) continue;
    if (days.reduce((s, d) => s + (sessionCount.get(d) ?? 0), 0) >= 2) return true;
  }
  return false;
}

export function unlockedBadges(ctx: BadgeContext): Set<string> {
  return new Set(BADGES.filter((b) => b.test(ctx)).map((b) => b.id));
}

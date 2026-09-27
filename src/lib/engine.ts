import {
  addDays,
  eachDay,
  endOfMonth,
  monthKey,
  startOfMonth,
  weekdayOf,
} from "./dates";
import type { Entry, Expense, ISODate, ScheduleSlot, Session, Settings } from "./types";

/* ------------------------------------------------------------------ */
/*  Impact unitaire                                                    */
/* ------------------------------------------------------------------ */

/** Minutes de dette générées par une dépense. */
export const expenseMinutes = (e: Pick<Expense, "amount">, rate: number) =>
  Math.round(e.amount * rate);

/** Minutes remboursées par une séance : uniquement le surplus au-delà du standard. */
export const sessionRepayment = (s: Pick<Session, "duration" | "standard">) =>
  Math.max(0, s.duration - s.standard);

export const isExpense = (e: Entry): e is Expense => e.kind === "expense";
export const isSession = (e: Entry): e is Session => e.kind === "session";

/* ------------------------------------------------------------------ */
/*  Chronologie du solde                                               */
/* ------------------------------------------------------------------ */

export interface TimelinePoint {
  date: ISODate;
  /** Solde de dette en fin de journée (≥ 0). */
  balance: number;
  added: number;
  repaid: number;
  /** Minutes réellement remboursées (plafonnées par la dette existante). */
  effectiveRepaid: number;
}

/**
 * Rejoue toutes les entrées jour par jour. La dette est plancher 0 :
 * un surplus de sport ne se « stocke » pas pour les excès futurs.
 */
export function buildTimeline(entries: Entry[], settings: Settings, until: ISODate): TimelinePoint[] {
  if (entries.length === 0) return [];
  const byDay = groupByDate(entries);
  const first = entries.reduce((min, e) => (e.date < min ? e.date : min), entries[0].date);
  const points: TimelinePoint[] = [];
  let balance = 0;
  for (const date of eachDay(first, until)) {
    const day = byDay.get(date) ?? [];
    const added = day.filter(isExpense).reduce((s, e) => s + expenseMinutes(e, settings.rate), 0);
    const repaid = day.filter(isSession).reduce((s, e) => s + sessionRepayment(e), 0);
    const before = balance + added;
    balance = Math.max(0, before - repaid);
    points.push({ date, balance, added, repaid, effectiveRepaid: before - balance });
  }
  return points;
}

export function balanceAt(timeline: TimelinePoint[], date: ISODate): number {
  let value = 0;
  for (const p of timeline) {
    if (p.date > date) break;
    value = p.balance;
  }
  return value;
}

export function groupByDate(entries: Entry[]): Map<ISODate, Entry[]> {
  const map = new Map<ISODate, Entry[]>();
  for (const e of entries) {
    const list = map.get(e.date);
    if (list) list.push(e);
    else map.set(e.date, [e]);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Planning                                                           */
/* ------------------------------------------------------------------ */

export function slotFor(date: ISODate, schedule: ScheduleSlot[]): ScheduleSlot | undefined {
  const wd = weekdayOf(date);
  return schedule.find((s) => s.day === wd);
}

export interface PlannedSlot {
  date: ISODate;
  time: string;
}

/** Séances planifiées entre `from` et `to` inclus. */
export function scheduledSlots(from: ISODate, to: ISODate, schedule: ScheduleSlot[]): PlannedSlot[] {
  if (schedule.length === 0) return [];
  const out: PlannedSlot[] = [];
  for (const date of eachDay(from, to)) {
    const slot = slotFor(date, schedule);
    if (slot) out.push({ date, time: slot.time });
  }
  return out;
}

export interface Plan {
  debt: number;
  /** Séances restantes sur lesquelles la dette est répartie. */
  slots: PlannedSlot[];
  next: PlannedSlot | null;
  /** Minutes à ajouter à chaque séance restante. */
  bonus: number;
  recommended: number;
  /** La répartition déborde sur le mois suivant (plus de séance ce mois-ci). */
  spillsOver: boolean;
  /** La séance recommandée dépasse 2× la durée standard. */
  heavy: boolean;
}

/**
 * Répartit la dette sur les séances planifiées restantes du mois.
 * Si une séance est déjà faite aujourd'hui, aujourd'hui ne compte plus.
 * S'il ne reste aucune séance ce mois-ci, on prend les 4 prochaines.
 */
export function computePlan(entries: Entry[], settings: Settings, todayDate: ISODate, debt: number): Plan {
  const doneToday = entries.some((e) => e.kind === "session" && e.date === todayDate);
  const from = doneToday ? addDays(todayDate, 1) : todayDate;
  let slots = from <= endOfMonth(todayDate) ? scheduledSlots(from, endOfMonth(todayDate), settings.schedule) : [];
  let spillsOver = false;
  if (slots.length === 0 && settings.schedule.length > 0) {
    slots = scheduledSlots(from, addDays(from, 34), settings.schedule).slice(0, 4);
    spillsOver = true;
  }
  const bonus = slots.length > 0 ? Math.ceil(debt / slots.length) : debt;
  const recommended = settings.standardDuration + bonus;
  return {
    debt,
    slots,
    next: slots[0] ?? null,
    bonus,
    recommended,
    spillsOver: spillsOver && debt > 0,
    heavy: recommended > settings.standardDuration * 2,
  };
}

/* ------------------------------------------------------------------ */
/*  Résumés                                                            */
/* ------------------------------------------------------------------ */

export interface PeriodSummary {
  spent: number;
  debtAdded: number;
  repaid: number;
  sessions: number;
  sportMinutes: number;
  expenses: number;
  scheduled: number;
  missed: number;
}

export function summarize(
  entries: Entry[],
  settings: Settings,
  from: ISODate,
  to: ISODate,
  todayDate: ISODate,
): PeriodSummary {
  const inRange = entries.filter((e) => e.date >= from && e.date <= to);
  const expenses = inRange.filter(isExpense);
  const sessions = inRange.filter(isSession);
  const sessionDays = new Set(sessions.map((s) => s.date));
  const slots = scheduledSlots(from, to, settings.schedule);
  return {
    spent: round2(expenses.reduce((s, e) => s + e.amount, 0)),
    debtAdded: expenses.reduce((s, e) => s + expenseMinutes(e, settings.rate), 0),
    repaid: sessions.reduce((s, e) => s + sessionRepayment(e), 0),
    sessions: sessions.length,
    sportMinutes: sessions.reduce((s, e) => s + e.duration, 0),
    expenses: expenses.length,
    scheduled: slots.length,
    missed: slots.filter((s) => s.date < todayDate && !sessionDays.has(s.date)).length,
  };
}

export const monthRange = (date: ISODate) => [startOfMonth(date), endOfMonth(date)] as const;

/* ------------------------------------------------------------------ */
/*  Calendrier                                                         */
/* ------------------------------------------------------------------ */

export type DayState = "done" | "missed" | "planned" | "extra" | "rest";

export interface CalendarDay {
  date: ISODate;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  slot?: ScheduleSlot;
  sessions: Session[];
  expenses: Expense[];
  state: DayState;
}

export function calendarMonth(
  entries: Entry[],
  settings: Settings,
  anyDayInMonth: ISODate,
  todayDate: ISODate,
): CalendarDay[] {
  const first = startOfMonth(anyDayInMonth);
  const last = endOfMonth(anyDayInMonth);
  const gridStart = addDays(first, 1 - weekdayOf(first));
  const gridEnd = addDays(last, 7 - weekdayOf(last));
  const byDay = groupByDate(entries);
  const mk = monthKey(first);

  return eachDay(gridStart, gridEnd).map((date) => {
    const list = byDay.get(date) ?? [];
    const sessions = list.filter(isSession);
    const expenses = list.filter(isExpense);
    const slot = slotFor(date, settings.schedule);
    let state: DayState = "rest";
    if (sessions.length > 0) state = slot ? "done" : "extra";
    else if (slot) state = date < todayDate ? "missed" : "planned";
    return {
      date,
      inMonth: monthKey(date) === mk,
      isToday: date === todayDate,
      isFuture: date > todayDate,
      slot,
      sessions,
      expenses,
      state,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Agrégats pour les graphiques                                       */
/* ------------------------------------------------------------------ */

export interface WeekBucket {
  weekStart: ISODate;
  minutes: number;
  repaid: number;
  sessions: number;
}

export function weeklyMinutes(entries: Entry[], weeks: number, todayDate: ISODate): WeekBucket[] {
  const currentWeek = addDays(todayDate, 1 - weekdayOf(todayDate));
  const buckets: WeekBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(currentWeek, -7 * i);
    const weekEnd = addDays(weekStart, 6);
    const sessions = entries.filter(
      (e): e is Session => e.kind === "session" && e.date >= weekStart && e.date <= weekEnd,
    );
    buckets.push({
      weekStart,
      minutes: sessions.reduce((s, e) => s + e.duration, 0),
      repaid: sessions.reduce((s, e) => s + sessionRepayment(e), 0),
      sessions: sessions.length,
    });
  }
  return buckets;
}

export function spendingByCategory(entries: Entry[], from: ISODate, to: ISODate) {
  const totals = new Map<Expense["category"], { amount: number; count: number }>();
  for (const e of entries) {
    if (e.kind !== "expense" || e.date < from || e.date > to) continue;
    const t = totals.get(e.category) ?? { amount: 0, count: 0 };
    t.amount += e.amount;
    t.count += 1;
    totals.set(e.category, t);
  }
  return [...totals.entries()]
    .map(([category, t]) => ({ category, amount: round2(t.amount), count: t.count }))
    .sort((a, b) => b.amount - a.amount);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

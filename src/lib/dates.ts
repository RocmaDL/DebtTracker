import type { ISODate, Weekday } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Formate une date en `YYYY-MM-DD` dans le fuseau local. */
export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse un `YYYY-MM-DD` en Date locale à midi (évite les pièges du changement d’heure). */
export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((fromISODate(a).getTime() - fromISODate(b).getTime()) / 86_400_000);
}

export function weekdayOf(s: ISODate): Weekday {
  const js = fromISODate(s).getDay();
  return (js === 0 ? 7 : js) as Weekday;
}

/** `YYYY-MM` */
export function monthKey(s: ISODate): string {
  return s.slice(0, 7);
}

export function startOfMonth(s: ISODate): ISODate {
  return `${monthKey(s)}-01`;
}

export function endOfMonth(s: ISODate): ISODate {
  const d = fromISODate(s);
  return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
}

export function addMonths(s: ISODate, n: number): ISODate {
  const d = fromISODate(startOfMonth(s));
  return toISODate(new Date(d.getFullYear(), d.getMonth() + n, 1, 12));
}

/** Lundi de la semaine contenant `s`. */
export function startOfWeek(s: ISODate): ISODate {
  return addDays(s, 1 - weekdayOf(s));
}

export function eachDay(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function today(): ISODate {
  return toISODate(new Date());
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", opts);
const dayMonth = fmt({ day: "numeric", month: "long" });
const weekdayLong = fmt({ weekday: "long" });
const monthYear = fmt({ month: "long", year: "numeric" });
const shortDate = fmt({ day: "numeric", month: "short" });

export const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
export const WEEKDAYS_LONG = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

export const formatDayMonth = (s: ISODate) => dayMonth.format(fromISODate(s));
export const formatShort = (s: ISODate) => shortDate.format(fromISODate(s));
export const formatWeekday = (s: ISODate) => weekdayLong.format(fromISODate(s));
export const formatMonth = (s: ISODate) => capitalize(monthYear.format(fromISODate(s)));

/** « Aujourd’hui », « Hier », « Demain » ou « mardi 12 mars ». */
export function formatRelative(s: ISODate, ref: ISODate): string {
  const diff = diffDays(s, ref);
  if (diff === 0) return "Aujourd’hui";
  if (diff === -1) return "Hier";
  if (diff === 1) return "Demain";
  return capitalize(`${formatWeekday(s)} ${formatDayMonth(s)}`);
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

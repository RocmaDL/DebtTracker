/** Date locale au format `YYYY-MM-DD` (jamais convertie en UTC). */
export type ISODate = string;

/** 1 = lundi … 7 = dimanche (norme ISO-8601). */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ExpenseCategory = "burger" | "pizza" | "tacos" | "kebab" | "sushi" | "sweet" | "other";
export type Activity = "gym" | "run" | "bike" | "swim" | "hiit" | "other";

interface BaseEntry {
  id: string;
  date: ISODate;
  createdAt: number;
  note?: string;
}

export interface Expense extends BaseEntry {
  kind: "expense";
  /** Montant en euros. */
  amount: number;
  category: ExpenseCategory;
}

export interface Session extends BaseEntry {
  kind: "session";
  /** Durée en minutes. */
  duration: number;
  activity: Activity;
  /** Durée standard au moment de la séance : seul le surplus rembourse. */
  standard: number;
}

export type Entry = Expense | Session;

export interface ScheduleSlot {
  day: Weekday;
  time: string; // HH:mm
}

export interface Settings {
  name: string;
  /** Minutes de dette par euro dépensé. */
  rate: number;
  /** Durée d'une séance « normale », en minutes. */
  standardDuration: number;
  schedule: ScheduleSlot[];
}

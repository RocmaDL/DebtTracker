export type TransactionType = 'expense' | 'sport';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  description: string;
  targetStandard?: number; // Only for sport
}

export interface WeeklySchedule {
  dayIndex: number; // 0-6 or 1-7 depending on usage (here 1=Mon, 7=Sun)
  time: string;
}

export interface UserSettings {
  standardDuration: number;
  schedule: WeeklySchedule[];
}

export interface DayData {
  day: number | null;
  date: string;
  schedule?: WeeklySchedule;
  isToday: boolean;
  session?: Transaction;
  dailyBalance?: number;
}

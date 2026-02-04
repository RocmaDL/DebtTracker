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
  dayIndex: number; // 1=Mon, 7=Sun
  time: string;
}

export interface UserSettings {
  standardDuration: number;
  schedule: WeeklySchedule[];
  theme?: 'light' | 'dark' | 'system';
  enableNotifications?: boolean;
}

export interface MonthData {
  accumulatedDebt: number;
  totalDebtForMonth: number;
  remainingDebt: number;
  sessionsDoneCount: number;
  totalScheduledSessions: number;
  remainingSessions: number;
  suggestedDuration: number;
  bonusPerSession: number;
  currentExpensesTotal: number;
  history: Transaction[];
  sessionsByDate: Record<string, Transaction>;
  currentStreak: number;
}

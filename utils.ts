import { Transaction, UserSettings } from './types';

export const getMonthKey = (date: Date): string => date.toISOString().slice(0, 7);

export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateMonthData = (
  transactions: Transaction[],
  currentDate: Date,
  userSettings: UserSettings
) => {
  const currentMonthKey = getMonthKey(currentDate);

  // 1. Past Debt (Before current month)
  const allExpenses = transactions
    .filter(t => t.type === 'expense' && t.date < currentMonthKey) 
    .reduce((sum, t) => sum + t.amount, 0);

  const allSportCredit = transactions
    .filter(t => t.type === 'sport' && t.date < currentMonthKey)
    .reduce((sum, t) => {
      const standard = t.targetStandard || userSettings.standardDuration;
      return sum + Math.max(0, t.amount - standard);
    }, 0);

  const accumulatedDebt = Math.ceil(allExpenses - allSportCredit);
  const totalDebtForMonth = Math.max(0, accumulatedDebt); 

  // 2. Current Month Data
  const currentExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.amount, 0);

  const sportTransactions = transactions
    .filter(t => t.type === 'sport' && t.date.startsWith(currentMonthKey))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentMonthCredit = sportTransactions.reduce((sum, t) => {
     const standard = t.targetStandard || userSettings.standardDuration;
     return sum + Math.max(0, t.amount - standard);
  }, 0);

  // 3. Scheduling logic
  const getScheduledSessionsCount = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for(let d=1; d<=daysInMonth; d++) {
      const dayOfWeek = new Date(year, month, d).getDay();
      // Adjust dayOfWeek to match 1=Mon (if that's how settings are stored) or just match index
      // Native getDay(): 0=Sun, 1=Mon. 
      // User settings usually map 1=Mon...7=Sun or 0=Sun. 
      // Assuming Settings use 1=Mon, 7=Sun.
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      if (userSettings.schedule.some(s => s.dayIndex === adjustedDay)) count++;
    }
    return count;
  };

  const totalScheduledSessions = getScheduledSessionsCount();
  const sessionsDoneCount = sportTransactions.length;
  const remainingSessions = Math.max(0, totalScheduledSessions - sessionsDoneCount);
  
  // 4. Remaining to pay
  // Total debt active = (Old Debt) + (Current Expenses) - (Current Credit)
  // But usually, we treat expense as Minutes of debt directly.
  const currentMonthNetDebt = (accumulatedDebt + currentExpenses) - currentMonthCredit;
  const remainingDebt = Math.max(0, currentMonthNetDebt);
  
  // Bonus per remaining session
  const bonusPerSession = remainingSessions > 0 
    ? Math.ceil(remainingDebt / remainingSessions) 
    : remainingDebt; 

  const suggestedDuration = userSettings.standardDuration + bonusPerSession;

  // Streak
  // Simple logic: number of sessions done this month. 
  // Advanced logic could check consecutive weeks, but let's stick to count for now.
  const currentStreak = sessionsDoneCount;

  return {
    accumulatedDebt,
    totalDebtForMonth,
    remainingDebt,
    sessionsDoneCount,
    totalScheduledSessions,
    remainingSessions,
    suggestedDuration, 
    bonusPerSession,
    currentExpensesTotal: currentExpenses,
    history: transactions
      .filter(t => t.date.startsWith(currentMonthKey))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    sessionsByDate: sportTransactions.reduce((acc, t) => {
      acc[t.date] = t;
      return acc;
    }, {} as Record<string, Transaction>),
    currentStreak
  };
};

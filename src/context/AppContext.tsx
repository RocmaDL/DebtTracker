import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserSettings, MonthData } from '../types';
import { calculateMonthData, getMonthKey } from '../utils/helpers';
import { NotificationService } from '../services/NotificationService';
import { GroupService } from '../services/GroupService';

const STORAGE_KEY_DATA = 'debt_tracker_data_v1';
const STORAGE_KEY_SETTINGS = 'debt_tracker_settings_v1';

interface AppContextType {
  transactions: Transaction[];
  userSettings: UserSettings;
  currentDate: Date;
  currentMonthData: MonthData;
  isLoading: boolean;

  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateSettings: (settings: UserSettings) => void;
  setCurrentDate: (date: Date) => void;
  resetHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    standardDuration: 60,
    schedule: [
      { dayIndex: 1, time: "18:00" }, // Lundi
      { dayIndex: 4, time: "19:00" }  // Jeudi
    ],
    theme: 'system',
    enableNotifications: true
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  // Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedData, savedSettings] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_DATA),
          AsyncStorage.getItem(STORAGE_KEY_SETTINGS)
        ]);

        if (savedData) setTransactions(JSON.parse(savedData));
        if (savedSettings) setUserSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(userSettings));
      // Sync notifications
      NotificationService.scheduleReminders(userSettings);
    }
  }, [userSettings, isLoading]);

  // Derived State
  const currentMonthData = useMemo(() =>
    calculateMonthData(transactions, currentDate, userSettings),
    [transactions, currentDate, userSettings]
  );

  // Actions
  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [...prev, t]);

    // Sync to groups in background
    GroupService.fetchUserGroups().then(groups => {
      if (groups.length > 0) {
        GroupService.logActivityToGroups(groups, t);
      }
    });
  };

  const updateTransaction = (t: Transaction) => {
    setTransactions(prev => prev.map(item => item.id === t.id ? t : item));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (s: UserSettings) => {
    setUserSettings(s);
  };

  const resetHistory = () => {
    const currentMonth = getMonthKey(new Date());
    // Remove everything before current month
    setTransactions(prev => prev.filter(t => t.date.startsWith(currentMonth)));
  };

  return (
    <AppContext.Provider value={{
      transactions,
      userSettings,
      currentDate,
      currentMonthData,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateSettings,
      setCurrentDate,
      resetHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

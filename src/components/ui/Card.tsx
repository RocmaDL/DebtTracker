import React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <View className={twMerge(
      "bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50",
      className
    )}>
      {children}
    </View>
  );
};

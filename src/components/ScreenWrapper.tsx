import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, RefreshControl } from 'react-native';
import { clsx } from 'clsx';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ScreenWrapper = ({
  children,
  scrollable = true,
  className,
  refreshing = false,
  onRefresh
}: ScreenWrapperProps) => {
  const containerStyle = clsx("flex-1 bg-slate-50 dark:bg-slate-950", className);

  if (scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
        <ScrollView
          className={containerStyle}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={containerStyle} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
};

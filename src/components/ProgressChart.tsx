import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Transaction } from '../types';
import { getMonthKey } from '../utils/helpers';

interface ProgressChartProps {
  transactions: Transaction[];
  currentDate: Date;
  standardDuration: number;
}

export const ProgressChart = ({ transactions, currentDate, standardDuration }: ProgressChartProps) => {
  const currentMonthKey = getMonthKey(currentDate);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  // Prepare data points
  let cumulativeDebt = 0;
  const dataPoints = [];
  const today = new Date().getDate();

  // Initial debt from previous months
  const pastTransactions = transactions.filter(t => t.date < currentMonthKey);
  // Re-calculate initial state (simplified logic from helpers for chart)
  const initialDebt = pastTransactions.reduce((acc, t) => {
    if (t.type === 'expense') return acc + t.amount;
    if (t.type === 'sport') return acc - Math.max(0, t.amount - (t.targetStandard || standardDuration));
    return acc;
  }, 0);

  cumulativeDebt = Math.max(0, initialDebt);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentMonthKey}-${d.toString().padStart(2, '0')}`;

    // Process transactions for this day
    const dayTrans = transactions.filter(t => t.date === dateStr);

    dayTrans.forEach(t => {
      if (t.type === 'expense') cumulativeDebt += t.amount;
      if (t.type === 'sport') cumulativeDebt -= Math.max(0, t.amount - (t.targetStandard || standardDuration));
    });

    cumulativeDebt = Math.max(0, cumulativeDebt);

    if (d <= today || (currentDate.getMonth() !== new Date().getMonth())) {
      dataPoints.push({
        value: cumulativeDebt,
        dataPointText: d % 5 === 0 ? Math.round(cumulativeDebt).toString() : '',
        label: d % 5 === 0 ? d.toString() : '',
      });
    }
  }

  return (
    <View className="overflow-hidden">
      <LineChart
        data={dataPoints}
        color="#f43f5e" // Rose-500
        thickness={3}
        startFillColor="rgba(244, 63, 94, 0.3)"
        endFillColor="rgba(244, 63, 94, 0.01)"
        startOpacity={0.9}
        endOpacity={0.2}
        initialSpacing={0}
        noOfSections={4}
        yAxisColor="lightgray"
        xAxisColor="lightgray"
        yAxisTextStyle={{ color: 'gray' }}
        width={Dimensions.get('window').width - 80}
        height={180}
        curved
        hideDataPoints={false}
        dataPointsColor="#f43f5e"
      />
    </View>
  );
};

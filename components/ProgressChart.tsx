import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Transaction } from '../types';
import { getMonthKey } from '../utils';

interface ProgressChartProps {
  transactions: Transaction[];
  currentDate: Date;
  standardDuration: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ transactions, currentDate, standardDuration }) => {
  const currentMonthKey = getMonthKey(currentDate);

  // Generate data for each day of the month up to today (or end of month)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const chartData = [];
  
  let cumulativeBalance = 0;

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentMonthKey}-${i.toString().padStart(2, '0')}`;
    
    // Skip future dates
    if (new Date(dateStr) > new Date()) break;

    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    const dayExpense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const dayCredit = dayTransactions
      .filter(t => t.type === 'sport')
      .reduce((sum, t) => {
        const std = t.targetStandard || standardDuration;
        return sum + Math.max(0, t.amount - std);
      }, 0);

    // Balance calculation: Positive means Debt increases, Negative means Debt decreases (Credit)
    // We want to track "Net Debt Added" this month.
    cumulativeBalance += (dayExpense - dayCredit);

    chartData.push({
      day: i,
      balance: cumulativeBalance,
      formattedDate: `${i}/${currentDate.getMonth() + 1}`
    });
  }

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-border-opacity)" className="opacity-10 dark:opacity-20" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#94a3b8'}} 
            interval={Math.floor(daysInMonth / 5)}
          />
          <YAxis 
            hide={true} 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke={cumulativeBalance >= 0 ? "#f43f5e" : "#10b981"} 
            fillOpacity={1} 
            fill={cumulativeBalance >= 0 ? "url(#colorBalance)" : "url(#colorCredit)"} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

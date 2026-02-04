import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { ProgressChart } from '../components/ProgressChart';
import { Utensils, TrendingUp, Dumbbell, Award, Timer, ChevronLeft, ChevronRight, ArrowUpRight, Trash2, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const {
    currentMonthData,
    userSettings,
    currentDate,
    setCurrentDate,
    deleteTransaction,
    transactions
  } = useApp();

  const navigation = useNavigation();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  const isDebtFree = currentMonthData.remainingDebt === 0 && currentMonthData.accumulatedDebt <= 0;

  return (
    <ScreenWrapper className="pt-4 px-4">
      {/* Header & Month Nav */}
      <View className="flex-row items-center justify-between mb-6 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={handlePrevMonth} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-slate-800 dark:text-white capitalize">
          {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>

        <TouchableOpacity onPress={handleNextMonth} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
        </TouchableOpacity>
      </View>

      {/* KPI Cards Grid */}
      <View className="flex-row gap-4 mb-6">
        {/* Expenses Card */}
        <Card className="flex-1 bg-white dark:bg-slate-800 relative overflow-hidden">
          <View className="absolute top-0 right-0 p-2 opacity-5">
             <Utensils size={80} color="black" />
          </View>
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dépenses</Text>
          <View className="flex-row items-baseline mb-2">
            <Text className="text-3xl font-black text-slate-900 dark:text-white">
              {currentMonthData.currentExpensesTotal}
            </Text>
            <Text className="text-sm font-bold text-slate-400 ml-1">€</Text>
          </View>
          <View className="flex-row items-center bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg self-start">
            <TrendingUp size={12} color="#f43f5e" />
            <Text className="text-[10px] font-bold text-rose-500 ml-1">
              +{Math.ceil(currentMonthData.currentExpensesTotal)}m dette
            </Text>
          </View>

          <TouchableOpacity
             onPress={() => navigation.navigate('AddTransaction')}
             className="absolute bottom-3 right-3 bg-rose-500 w-10 h-10 rounded-xl items-center justify-center shadow-lg shadow-rose-500/30"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </Card>

        {/* Goal Card */}
        <Card className={`flex-1 overflow-hidden relative ${isDebtFree ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800'}`}>
          <View className="absolute bottom-[-10] right-[-10] opacity-10">
             {isDebtFree ? <Award size={100} color="white" /> : <Timer size={100} color="white" />}
          </View>

          <Text className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDebtFree ? 'text-emerald-100' : 'text-slate-400'}`}>
            Objectif
          </Text>

          <View className="flex-row items-baseline mb-2">
            <Text className="text-3xl font-black text-white">
              {currentMonthData.suggestedDuration}
            </Text>
            <Text className="text-sm font-bold text-white/60 ml-1">min</Text>
          </View>

          <View className="mt-auto">
             <Text className={`text-[10px] font-medium ${isDebtFree ? 'text-emerald-50' : 'text-slate-300'}`}>
               Base: {userSettings.standardDuration} min
             </Text>
             {currentMonthData.bonusPerSession > 0 && (
               <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-lg mt-1 self-start">
                 <ArrowUpRight size={10} color="white" />
                 <Text className="text-[10px] font-bold text-white ml-1">
                   +{currentMonthData.bonusPerSession} min/séance
                 </Text>
               </View>
             )}
          </View>
        </Card>
      </View>

      {/* Chart Section */}
      <Card className="mb-6">
        <View className="flex-row items-center justify-between mb-4">
           <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Évolution Dette</Text>
           <View className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
             <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
               Reste: {Math.round(currentMonthData.remainingDebt)} min
             </Text>
           </View>
        </View>
        <ProgressChart
          transactions={transactions}
          currentDate={currentDate}
          standardDuration={userSettings.standardDuration}
        />
      </Card>

      {/* Recent History */}
      <View className="mb-8">
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Activité Récente</Text>
        {currentMonthData.history.length === 0 ? (
          <Text className="text-center text-slate-400 italic py-8">Aucune activité ce mois-ci.</Text>
        ) : (
          currentMonthData.history.map((item) => (
            <View key={item.id} className="flex-row items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-3 shadow-sm">
              <View className="flex-row items-center gap-3">
                 <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                    item.type === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-500/10'
                    : 'bg-emerald-50 dark:bg-emerald-500/10'
                 }`}>
                   {item.type === 'expense'
                     ? <Utensils size={18} className="text-rose-500" color="#f43f5e" />
                     : <Dumbbell size={18} className="text-emerald-500" color="#10b981" />
                   }
                 </View>
                 <View>
                   <Text className="font-bold text-slate-800 dark:text-white">{item.description}</Text>
                   <Text className="text-xs text-slate-400">
                     {new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                   </Text>
                 </View>
              </View>

              <View className="flex-row items-center gap-3">
                 <Text className={`font-black text-lg ${
                    item.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                 }`}>
                   {item.type === 'expense' ? `-${item.amount.toFixed(2)}€` : `+${item.amount}m`}
                 </Text>
                 <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                   <Trash2 size={16} className="text-slate-300" color="#cbd5e1" />
                 </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

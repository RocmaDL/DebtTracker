import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCalendarSync } from '../hooks/useCalendarSync';
import { ChevronLeft, ChevronRight, Plus, Share } from 'lucide-react-native';
import { clsx } from 'clsx';
import { DayData } from '../types';

export default function CalendarScreen() {
  const { currentMonthData, currentDate, setCurrentDate, userSettings } = useApp();
  const navigation = useNavigation();
  const { syncSessionToCalendar } = useCalendarSync();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  // Calendar Generation Logic
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: DayData[] = [];
    let startDay = firstDay.getDay() - 1; // 0=Dim, 1=Lun. Want Lun=0.
    if (startDay === -1) startDay = 6;

    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, date: '', isToday: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();

      const scheduleItem = userSettings.schedule.find(s => s.dayIndex === dayOfWeek);
      const session = currentMonthData.sessionsByDate[dateStr];

      days.push({
        day: i,
        date: dateStr,
        schedule: scheduleItem,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        session: session
      });
    }
    return days;
  }, [currentDate, userSettings.schedule, currentMonthData.sessionsByDate]);

  const handleDayPress = (day: DayData) => {
    if (day.session) {
      // If session exists, ask to sync
      Alert.alert(
        "Séance du " + day.day,
        `Durée : ${day.session.amount} min\n${day.session.description}`,
        [
          { text: "Annuler", style: 'cancel' },
          {
            text: "Sync Calendrier",
            onPress: () => day.session && syncSessionToCalendar(day.session, userSettings)
          }
        ]
      );
    } else {
      // Else navigate to add transaction for this date (Not fully implemented passing date params to AddTransaction, but simplified for now)
      // Ideally I would pass params to navigation
      // navigation.navigate('AddTransaction', { date: day.date, type: 'sport' });
      // For now, simple redirect
      Alert.alert("Info", "Utilisez le bouton '+' pour ajouter une séance à cette date.");
    }
  };

  return (
    <ScreenWrapper className="pt-4 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
         <Text className="text-xl font-black text-slate-900 dark:text-white">Agenda</Text>
         <View className="flex-row gap-2">
           <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
             <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
           </TouchableOpacity>
           <Text className="self-center font-bold text-slate-600 dark:text-slate-300 mx-2 capitalize">
             {currentDate.toLocaleDateString('fr-FR', { month: 'short' })}
           </Text>
           <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
             <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
           </TouchableOpacity>
         </View>
      </View>

      <Card>
        {/* Days Header */}
        <View className="flex-row justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
          {['L','M','M','J','V','S','D'].map((d, i) => (
            <Text key={i} className="w-10 text-center font-bold text-slate-300 dark:text-slate-600">{d}</Text>
          ))}
        </View>

        {/* Days Grid */}
        <View className="flex-row flex-wrap gap-y-2 justify-between">
          {calendarDays.map((day, i) => {
            if (!day.day) return <View key={`empty-${i}`} className="w-[13%]" />;

            const isDone = !!day.session;
            const isScheduled = !!day.schedule;
            const isToday = day.isToday;

            return (
              <TouchableOpacity
                key={day.date}
                onPress={() => handleDayPress(day)}
                className={clsx(
                  "w-[13%] aspect-[0.8] rounded-xl items-center justify-center mb-2 relative",
                  isDone
                    ? "bg-emerald-500 shadow-md shadow-emerald-500/20"
                    : isToday
                      ? "bg-blue-50 dark:bg-blue-500/20 border-2 border-blue-500"
                      : isScheduled
                        ? "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        : "bg-transparent"
                )}
              >
                <Text className={clsx(
                  "text-sm",
                  isDone ? "text-white font-bold" : isToday ? "text-blue-600 font-bold" : "text-slate-600 dark:text-slate-400"
                )}>
                  {day.day}
                </Text>

                {isDone && (
                  <View className="absolute bottom-1 w-1 h-1 bg-white rounded-full opacity-80" />
                )}

                {!isDone && isScheduled && (
                   <View className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View className="mt-6">
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Légende</Text>
        <View className="flex-row gap-4 flex-wrap">
           <View className="flex-row items-center gap-2">
             <View className="w-4 h-4 bg-emerald-500 rounded-full" />
             <Text className="text-slate-600 dark:text-slate-300 text-xs">Fait</Text>
           </View>
           <View className="flex-row items-center gap-2">
             <View className="w-4 h-4 bg-white border-2 border-blue-500 rounded-full" />
             <Text className="text-slate-600 dark:text-slate-300 text-xs">Aujourd'hui</Text>
           </View>
           <View className="flex-row items-center gap-2">
             <View className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
               <View className="w-1 h-1 bg-blue-400 rounded-full" />
             </View>
             <Text className="text-slate-600 dark:text-slate-300 text-xs">Prévu</Text>
           </View>
        </View>
      </View>

      {/* Quick Add Helper */}
      <View className="mt-8">
        <Button onPress={() => navigation.navigate('AddTransaction' as never)} variant="secondary">
          <Plus size={18} color="black" /> Ajouter une séance manuellement
        </Button>
      </View>

    </ScreenWrapper>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, Clock, Trash2, Bell, RefreshCw } from 'lucide-react-native';
import { clsx } from 'clsx';
import { UserSettings } from '../types';

export default function SettingsScreen() {
  const { userSettings, updateSettings, resetHistory } = useApp();
  const [tempSettings, setTempSettings] = useState<UserSettings>(userSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTempSettings(userSettings);
    setHasChanges(false);
  }, [userSettings]);

  const handleChange = (newSettings: UserSettings) => {
    setTempSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(tempSettings);
    setHasChanges(false);
    Alert.alert("Succès", "Paramètres sauvegardés !");
  };

  const toggleDay = (dayIndex: number) => {
    const exists = tempSettings.schedule.find(s => s.dayIndex === dayIndex);
    let newSchedule;
    if (exists) {
      newSchedule = tempSettings.schedule.filter(s => s.dayIndex !== dayIndex);
    } else {
      newSchedule = [...tempSettings.schedule, { dayIndex, time: "18:00" }];
    }
    handleChange({ ...tempSettings, schedule: newSchedule });
  };

  const updateTime = (dayIndex: number, time: string) => {
    const newSchedule = tempSettings.schedule.map(s =>
      s.dayIndex === dayIndex ? { ...s, time } : s
    );
    handleChange({ ...tempSettings, schedule: newSchedule });
  };

  const handleReset = () => {
    Alert.alert(
      "Réinitialiser l'historique ?",
      "Cela effacera toutes les dettes passées et ne gardera que le mois en cours.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", style: "destructive", onPress: resetHistory }
      ]
    );
  };

  return (
    <ScreenWrapper className="pt-4 px-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-black text-slate-900 dark:text-white">Paramètres</Text>
        {hasChanges && (
          <Button size="sm" onPress={handleSave}>Sauvegarder</Button>
        )}
      </View>

      <ScrollView contentContainerStyle={{ gap: 16 }}>
        {/* Notifications & Global */}
        <Card>
           <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                 <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                   <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                 </View>
                 <Text className="font-bold text-slate-700 dark:text-slate-200">Notifications</Text>
              </View>
              <Switch
                value={tempSettings.enableNotifications}
                onValueChange={(val) => handleChange({ ...tempSettings, enableNotifications: val })}
                trackColor={{ true: '#3b82f6', false: '#cbd5e1' }}
              />
           </View>

           <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Durée Standard (min)</Text>
              <TextInput
                value={String(tempSettings.standardDuration)}
                onChangeText={(v) => handleChange({ ...tempSettings, standardDuration: parseInt(v) || 0 })}
                keyboardType="numeric"
                className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700"
              />
           </View>
        </Card>

        {/* Schedule */}
        <Card>
           <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Semaine Type</Text>
           <View className="gap-2">
             {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map((day, i) => {
               const dayIndex = i + 1;
               const scheduleItem = tempSettings.schedule.find(s => s.dayIndex === dayIndex);
               const isSelected = !!scheduleItem;

               return (
                 <TouchableOpacity
                   key={day}
                   onPress={() => toggleDay(dayIndex)}
                   className={clsx(
                     "flex-row items-center justify-between p-3 rounded-xl border",
                     isSelected
                       ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
                       : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                   )}
                 >
                    <View className="flex-row items-center gap-3">
                       <View className={clsx(
                         "w-6 h-6 rounded-md items-center justify-center border",
                         isSelected ? "bg-blue-600 border-blue-600" : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                       )}>
                         {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                       </View>
                       <Text className={clsx("font-bold", isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-400")}>{day}</Text>
                    </View>

                    {isSelected && (
                      <View className="flex-row items-center bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                         <Clock size={14} className="text-blue-500 mr-2" />
                         <TextInput
                            value={scheduleItem.time}
                            onChangeText={(t) => updateTime(dayIndex, t)}
                            placeholder="HH:MM"
                            maxLength={5}
                            className="font-bold text-slate-700 dark:text-slate-200 p-0"
                         />
                      </View>
                    )}
                 </TouchableOpacity>
               );
             })}
           </View>
        </Card>

        {/* Danger Zone */}
        <View className="mt-4">
           <Button variant="ghost" onPress={handleReset} className="flex-row gap-2 text-rose-500">
              <RefreshCw size={16} className="text-rose-500" />
              <Text className="text-rose-500 font-bold">Réinitialiser l'historique</Text>
           </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenWrapper>
  );
}

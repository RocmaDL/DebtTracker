import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { generateId } from '../utils/helpers';
import { X, Utensils, Dumbbell, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { clsx } from 'clsx';

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const { addTransaction, userSettings } = useApp();

  const [type, setType] = useState<'expense' | 'sport'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // For Sport
  const [duration, setDuration] = useState('60');

  const handleSubmit = () => {
    if (!amount && type === 'expense') return;
    if (!duration && type === 'sport') return;

    const newTx = {
      id: generateId(),
      type,
      date,
      description: description || (type === 'expense' ? 'Fast Food' : 'Séance Sport'),
      amount: type === 'expense' ? parseFloat(amount) : parseInt(duration),
      targetStandard: type === 'sport' ? userSettings.standardDuration : undefined
    };

    addTransaction(newTx);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <Text className="text-xl font-black text-slate-900 dark:text-white">Nouvelle Entrée</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
           <X size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {/* Type Selector */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            onPress={() => setType('expense')}
            className={clsx(
              "flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center gap-2",
              type === 'expense'
                ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
            )}
          >
            <Utensils size={20} color={type === 'expense' ? '#f43f5e' : 'gray'} />
            <Text className={clsx("font-bold", type === 'expense' ? "text-rose-500" : "text-slate-400")}>Dépense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType('sport')}
            className={clsx(
              "flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center gap-2",
              type === 'sport'
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
            )}
          >
            <Dumbbell size={20} color={type === 'sport' ? '#10b981' : 'gray'} />
            <Text className={clsx("font-bold", type === 'sport' ? "text-emerald-500" : "text-slate-400")}>Sport</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-6">
           <View>
             <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</Text>
             <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <CalendarIcon size={20} color="gray" />
                <TextInput
                   value={date}
                   onChangeText={setDate}
                   placeholder="YYYY-MM-DD"
                   className="flex-1 ml-3 font-bold text-slate-900 dark:text-white text-lg"
                />
             </View>
           </View>

           {type === 'expense' ? (
             <View>
               <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Montant (€)</Text>
               <TextInput
                 value={amount}
                 onChangeText={setAmount}
                 keyboardType="numeric"
                 autoFocus
                 placeholder="0.00"
                 className="w-full text-5xl font-black text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-700 py-2 focus:border-rose-500"
               />
             </View>
           ) : (
             <View>
               <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Durée (minutes)</Text>
               <View className="flex-row items-center gap-4">
                  <TouchableOpacity onPress={() => setDuration(d => String(Math.max(0, parseInt(d || '0') - 5)))} className="p-4 bg-slate-100 rounded-xl">
                    <Text className="font-bold">-5</Text>
                  </TouchableOpacity>
                  <TextInput
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    className="flex-1 text-center text-4xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700"
                  />
                  <TouchableOpacity onPress={() => setDuration(d => String(parseInt(d || '0') + 5))} className="p-4 bg-slate-100 rounded-xl">
                    <Text className="font-bold">+5</Text>
                  </TouchableOpacity>
               </View>
             </View>
           )}

           <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={type === 'expense' ? "McDo, KFC..." : "Séance salle, Footing..."}
                className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-lg font-medium text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700"
              />
           </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-slate-100 dark:border-slate-800">
         <Button
           onPress={handleSubmit}
           variant={type === 'expense' ? 'danger' : 'success'}
           size="lg"
         >
           Ajouter {type === 'expense' ? 'Dépense' : 'Séance'}
         </Button>
      </View>
    </View>
  );
}

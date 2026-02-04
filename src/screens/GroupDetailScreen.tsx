import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Share, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GroupService } from '../services/GroupService';
import { Group, GroupActivity } from '../types';
import { Card } from '../components/ui/Card';
import { Utensils, Dumbbell, Copy, ChevronLeft } from 'lucide-react-native';
import { clsx } from 'clsx';
import * as Clipboard from 'expo-clipboard';

export default function GroupDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params as { group: Group };

  const [activities, setActivities] = useState<GroupActivity[]>([]);

  useEffect(() => {
    const unsubscribe = GroupService.getGroupActivity(group.id, (data) => {
      setActivities(data);
    });
    return () => unsubscribe();
  }, [group.id]);

  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(group.inviteCode);
    Alert.alert("Copié !", "Code d'invitation copié dans le presse-papier.");
  };

  return (
    <ScreenWrapper className="pt-4 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
           <ChevronLeft size={24} color="gray" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white">{group.name}</Text>
          <Text className="text-xs text-slate-400">{group.members.length} membres</Text>
        </View>
      </View>

      {/* Invite Card */}
      <TouchableOpacity onPress={copyInviteCode}>
        <Card className="bg-blue-600 border-none mb-6">
           <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Code d'invitation</Text>
           <View className="flex-row items-center justify-between">
              <Text className="text-3xl font-black text-white tracking-widest">{group.inviteCode}</Text>
              <Copy size={20} color="white" />
           </View>
        </Card>
      </TouchableOpacity>

      {/* Feed */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Activité du Groupe</Text>

      {activities.length === 0 ? (
        <Text className="text-center text-slate-400 italic mt-8">Aucune activité pour le moment.</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View className="flex-row bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
               {/* Icon */}
               <View className={clsx(
                 "w-10 h-10 rounded-full items-center justify-center mr-4",
                 item.type === 'expense' ? "bg-rose-100 dark:bg-rose-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
               )}>
                 {item.type === 'expense'
                   ? <Utensils size={18} className="text-rose-600 dark:text-rose-400" />
                   : <Dumbbell size={18} className="text-emerald-600 dark:text-emerald-400" />
                 }
               </View>

               {/* Content */}
               <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                     <Text className="font-bold text-slate-900 dark:text-white text-base">{item.userName}</Text>
                     <Text className="text-xs text-slate-400">
                       {new Date(item.timestamp).toLocaleDateString()}
                     </Text>
                  </View>

                  <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {item.type === 'expense' ? 'A craqué pour :' : 'A fait du sport :'} <Text className="font-medium text-slate-700 dark:text-slate-300">{item.description}</Text>
                  </Text>

                  <View className="mt-2 flex-row">
                    <Text className={clsx(
                      "font-black text-lg",
                      item.type === 'expense' ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {item.type === 'expense' ? `-${item.amount}€` : `+${item.amount} min`}
                    </Text>
                  </View>
               </View>
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

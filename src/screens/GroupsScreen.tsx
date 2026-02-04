import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GroupService } from '../services/GroupService';
import { Group } from '../types';
import { Users, Plus, Hash, X, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { clsx } from 'clsx';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form States
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const unsubscribe = GroupService.getUserGroups((data) => {
      setGroups(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    try {
      await GroupService.createGroup(newGroupName, 'friends'); // Default type for now
      setShowCreateModal(false);
      setNewGroupName('');
      Alert.alert("Succès", "Groupe créé !");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode) return;
    try {
      await GroupService.joinGroup(inviteCode.toUpperCase().trim());
      setShowJoinModal(false);
      setInviteCode('');
      Alert.alert("Succès", "Groupe rejoint !");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  return (
    <ScreenWrapper className="pt-4 px-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-black text-slate-900 dark:text-white">Mes Groupes</Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-4 mb-6">
        <Button
          className="flex-1"
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={18} color="white" /> Créer
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onPress={() => setShowJoinModal(true)}
        >
          <Hash size={18} color="black" /> Rejoindre
        </Button>
      </View>

      {/* Groups List */}
      {groups.length === 0 && !loading ? (
        <View className="items-center py-10 opacity-50">
           <Users size={64} color="gray" />
           <Text className="mt-4 text-slate-500 font-medium text-center">Vous ne faites partie d'aucun groupe.</Text>
           <Text className="text-slate-400 text-sm text-center">Rejoignez vos amis pour vous motiver !</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('GroupDetail', { group: item })}>
              <Card className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                   <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
                      <Users size={24} className="text-blue-600 dark:text-blue-400" />
                   </View>
                   <View>
                     <Text className="font-bold text-lg text-slate-900 dark:text-white">{item.name}</Text>
                     <Text className="text-xs text-slate-400">{item.members.length} membres</Text>
                   </View>
                </View>
                <ChevronRight size={20} className="text-slate-300" />
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* CREATE MODAL */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
         <View className="flex-1 justify-end bg-slate-900/50">
            <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
               <View className="flex-row justify-between mb-6">
                 <Text className="text-xl font-bold text-slate-900 dark:text-white">Nouveau Groupe</Text>
                 <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                   <X size={24} color="gray" />
                 </TouchableOpacity>
               </View>
               <TextInput
                 placeholder="Nom du groupe (ex: La Team Sport)"
                 value={newGroupName}
                 onChangeText={setNewGroupName}
                 className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold text-slate-900 dark:text-white mb-6 border border-slate-100 dark:border-slate-700"
               />
               <Button onPress={handleCreateGroup}>Créer le groupe</Button>
               <View className="h-8"/>
            </View>
         </View>
      </Modal>

      {/* JOIN MODAL */}
      <Modal visible={showJoinModal} animationType="slide" transparent>
         <View className="flex-1 justify-end bg-slate-900/50">
            <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
               <View className="flex-row justify-between mb-6">
                 <Text className="text-xl font-bold text-slate-900 dark:text-white">Rejoindre un Groupe</Text>
                 <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                   <X size={24} color="gray" />
                 </TouchableOpacity>
               </View>
               <TextInput
                 placeholder="Code d'invitation (6 caractères)"
                 value={inviteCode}
                 onChangeText={setInviteCode}
                 autoCapitalize="characters"
                 maxLength={6}
                 className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold text-slate-900 dark:text-white mb-6 border border-slate-100 dark:border-slate-700 text-center tracking-widest text-xl"
               />
               <Button onPress={handleJoinGroup} variant="secondary">Rejoindre</Button>
               <View className="h-8"/>
            </View>
         </View>
      </Modal>

    </ScreenWrapper>
  );
}

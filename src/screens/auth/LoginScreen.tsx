import React, { useState } from 'react';
import { View, Text, TextInput, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { TrendingUp, Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="justify-center px-6">
      <View className="items-center mb-10">
        <View className="bg-gradient-to-tr from-orange-500 to-rose-600 p-4 rounded-2xl shadow-lg shadow-orange-500/20 mb-4">
           <TrendingUp size={40} color="white" />
        </View>
        <Text className="text-3xl font-black text-slate-900 dark:text-white">Connexion</Text>
        <Text className="text-slate-500 mt-2">Bon retour sur DebtTracker !</Text>
      </View>

      <View className="space-y-4 mb-6">
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
           <Mail size={20} className="text-slate-400 mr-3" />
           <TextInput
             placeholder="Email"
             value={email}
             onChangeText={setEmail}
             autoCapitalize="none"
             className="flex-1 font-bold text-slate-900 dark:text-white"
           />
        </View>
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
           <Lock size={20} className="text-slate-400 mr-3" />
           <TextInput
             placeholder="Mot de passe"
             value={password}
             onChangeText={setPassword}
             secureTextEntry
             className="flex-1 font-bold text-slate-900 dark:text-white"
           />
        </View>
      </View>

      <Button onPress={handleLogin} loading={loading} size="lg" className="mb-4">
        Se connecter
      </Button>

      <View className="flex-row justify-center gap-1">
        <Text className="text-slate-500">Pas encore de compte ?</Text>
        <Text
          className="text-blue-600 font-bold"
          onPress={() => navigation.navigate('Signup' as never)}
        >
          S'inscrire
        </Text>
      </View>
    </ScreenWrapper>
  );
}

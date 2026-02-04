import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { TrendingUp } from 'lucide-react-native';

// Animated Splash Screen Component
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [scale] = useState(new Animated.Value(0.5));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.elastic(1.5)
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]),
      Animated.delay(1000), // Wait a bit
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => onFinish());
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
      <Animated.View style={{ transform: [{ scale }], opacity }} className="items-center">
        <View className="bg-gradient-to-tr from-orange-500 to-rose-600 p-6 rounded-3xl shadow-2xl shadow-orange-500/30 mb-4">
           <TrendingUp size={64} color="white" />
        </View>
        <Text className="text-3xl font-bold text-slate-800 dark:text-white">
          Debt<Text className="text-blue-600">Tracker</Text>
        </Text>
        <Text className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">FastFood Edition</Text>
      </Animated.View>
    </View>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AppProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AppProvider>
  );
}

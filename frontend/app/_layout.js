import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { TimerProvider } from '../src/context/TimerContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TimerProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="splash" />
        <StatusBar style="light" />
      </TimerProvider>
    </GestureHandlerRootView>
  );
}



import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="collaboration"
        options={{
          title: 'Collab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}



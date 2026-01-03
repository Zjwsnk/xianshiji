import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Normal white
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={28} color={focused ? '#769678' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '库存管理',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="bar-chart-2" size={28} color={focused ? '#769678' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: '消息',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="message-circle" size={28} color={focused ? '#769678' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={28} color={focused ? '#769678' : color} />
          ),
        }}
      />
    </Tabs>
  );
}

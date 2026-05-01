import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#16213e', borderTopColor: '#0f3460' },
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#ffffff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color, size }) => <Ionicons name="american-football" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="picks"
        options={{
          title: 'Picks',
          tabBarIcon: ({ color, size }) => <Ionicons name="star" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="analysts" options={{ href: null }} />
      <Tabs.Screen name="analyst/[id]" options={{ href: null }} />
    </Tabs>
  );
}

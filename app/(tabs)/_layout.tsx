import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Tab 导航布局
 * 使用 @expo/vector-icons 图标
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          height: Platform.OS === 'web' ? 55 : 50 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '兑换码',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="ticket" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: '类别',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="folder" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="gear" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

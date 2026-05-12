import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';

export default function NurseTabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: '#f0f0f0',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 64 : 50,
          paddingBottom: Platform.OS === 'android' ? 8 : 0,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="patients"
        options={{
          title: t('patients'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('alerts'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

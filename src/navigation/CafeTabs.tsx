import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/config/theme';
import { DashboardScreen } from '@/features/cafe-dashboard/screens/DashboardScreen';
import { RedeemScreen } from '@/features/cafe-redeem/screens/RedeemScreen';
import { CafeMenuScreen } from '@/features/cafe-menu/screens/MenuScreen';
import { ReportsScreen } from '@/features/cafe-reports/screens/ReportsScreen';
import { CafeSettingsScreen } from '@/features/cafe-settings/screens/SettingsScreen';
import type { CafeTabParamList } from './types';

const Tab = createBottomTabNavigator<CafeTabParamList>();

const TAB_ICONS: Record<keyof CafeTabParamList, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  Redeem: { focused: 'qr-code', unfocused: 'qr-code-outline' },
  Menu: { focused: 'restaurant', unfocused: 'restaurant-outline' },
  Reports: { focused: 'document-text', unfocused: 'document-text-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

export const CafeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.espresso,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarLabelStyle: {
          fontFamily: Typography.family.medium,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray100,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Redeem" component={RedeemScreen} />
      <Tab.Screen name="Menu" component={CafeMenuScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={CafeSettingsScreen} />
    </Tab.Navigator>
  );
};

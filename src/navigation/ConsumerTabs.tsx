import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/config/theme';
import { DiscoverScreen } from '@/features/discovery/screens/DiscoverScreen';
import { MapScreen } from '@/features/map/screens/MapScreen';
import { WalletScreen } from '@/features/wallet/screens/WalletScreen';
import { OrdersScreen } from '@/features/orders/screens/OrdersScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import type { ConsumerTabParamList } from './types';

const Tab = createBottomTabNavigator<ConsumerTabParamList>();

const TAB_ICONS: Record<keyof ConsumerTabParamList, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Discover: { focused: 'compass', unfocused: 'compass-outline' },
  Map: { focused: 'map', unfocused: 'map-outline' },
  Wallet: { focused: 'wallet', unfocused: 'wallet-outline' },
  Orders: { focused: 'receipt', unfocused: 'receipt-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

export const ConsumerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.caramel,
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
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

/**
 * Consumer Stack Navigator
 *
 * Wraps ConsumerTabs in a native stack so tab screens can
 * push to detail screens (CafeDetail, MenuItemDetail, BuyCredits,
 * CreditHistory, OrderDetail, RedemptionActive) that overlay the tab bar.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConsumerTabs } from './ConsumerTabs';
import { CafeDetailScreen } from '@/features/discovery/screens/CafeDetailScreen';
import { MenuItemDetailScreen } from '@/features/discovery/screens/MenuItemDetailScreen';
import { BuyCreditsScreen } from '@/features/wallet/screens/BuyCreditsScreen';
import { CreditHistoryScreen } from '@/features/wallet/screens/CreditHistoryScreen';
import { OrderDetailScreen } from '@/features/orders/screens/OrderDetailScreen';
import { RedemptionActiveScreen } from '@/features/orders/screens/RedemptionActiveScreen';
import type { ConsumerStackParamList } from './types';

const Stack = createNativeStackNavigator<ConsumerStackParamList>();

export const ConsumerStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConsumerTabs" component={ConsumerTabs} />
      <Stack.Screen
        name="CafeDetail"
        component={CafeDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MenuItemDetail"
        component={MenuItemDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BuyCredits"
        component={BuyCreditsScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="CreditHistory"
        component={CreditHistoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RedemptionActive"
        component={RedemptionActiveScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

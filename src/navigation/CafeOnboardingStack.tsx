import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BusinessProfileScreen } from '@/features/cafe-onboarding/screens/BusinessProfileScreen';
import { MenuSetupScreen } from '@/features/cafe-onboarding/screens/MenuSetupScreen';
import { PayoutSetupScreen } from '@/features/cafe-onboarding/screens/PayoutSetupScreen';
import { ReviewGoLiveScreen } from '@/features/cafe-onboarding/screens/ReviewGoLiveScreen';
import type { CafeOnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<CafeOnboardingStackParamList>();

/**
 * Cafe Onboarding Wizard
 *
 * 4-step flow for new cafe owners:
 * BusinessProfile → MenuSetup → PayoutSetup → ReviewGoLive
 *
 * Shown when user.role === CAFE_OWNER && needsOnboarding === true.
 * After completing ReviewGoLive, completeOnboarding() is called and
 * RootNavigator transitions to CafeTabs.
 */
export const CafeOnboardingStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BusinessProfile"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen name="MenuSetup" component={MenuSetupScreen} />
      <Stack.Screen name="PayoutSetup" component={PayoutSetupScreen} />
      <Stack.Screen name="ReviewGoLive" component={ReviewGoLiveScreen} />
    </Stack.Navigator>
  );
};

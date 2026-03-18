import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/config/constants';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthStack } from './AuthStack';
import { ConsumerStack } from './ConsumerStack';
import { CafeTabs } from './CafeTabs';
import { CafeOnboardingStack } from './CafeOnboardingStack';

/**
 * Root Navigator
 *
 * Uses conditional rendering (not navigation actions) to switch
 * between auth, consumer, cafe onboarding, and cafe flows based
 * on auth state. This is the recommended React Navigation pattern
 * for auth flows because it produces natural transitions and
 * prevents back-navigating to the login screen.
 *
 * Flow:
 * 1. No user → AuthStack (Welcome/SignUp/Login/RoleSelection)
 * 2. Cafe owner + needsOnboarding → CafeOnboardingStack (4-step wizard)
 * 3. Cafe owner/staff → CafeTabs
 * 4. Consumer → ConsumerStack (tabs + detail screens)
 */
export const RootNavigator: React.FC = () => {
  const { user, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading CoffeePass..." />;
  }

  if (!user) {
    return <AuthStack />;
  }

  // Cafe owners who haven't completed onboarding see the wizard
  if (
    (user.role === UserRole.CAFE_OWNER || user.role === UserRole.CAFE_STAFF) &&
    needsOnboarding
  ) {
    return <CafeOnboardingStack />;
  }

  // Cafe owners/staff who completed onboarding see the cafe dashboard
  if (user.role === UserRole.CAFE_OWNER || user.role === UserRole.CAFE_STAFF) {
    return <CafeTabs />;
  }

  // Everyone else (consumers, admins) sees consumer stack with tabs + detail screens
  return <ConsumerStack />;
};

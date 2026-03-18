/**
 * Navigation Type Definitions
 *
 * Provides type-safe navigation throughout the app.
 * Every screen's route params are defined here.
 */

import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { UserRole } from '@/config/constants';

// ─── Auth Stack ──────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  RoleSelection: {
    name: string;
    email: string;
    password: string;
  };
};

// ─── Cafe Onboarding Stack ──────────────────────────────

export type CafeOnboardingStackParamList = {
  BusinessProfile: undefined;
  MenuSetup: undefined;
  PayoutSetup: undefined;
  ReviewGoLive: undefined;
};

// ─── Consumer Tab + Stack Navigation ─────────────────────

export type ConsumerTabParamList = {
  Discover: undefined;
  Map: undefined;
  Wallet: undefined;
  Orders: undefined;
  Profile: undefined;
};

/** Stack screens accessible from consumer tabs */
export type ConsumerStackParamList = {
  ConsumerTabs: NavigatorScreenParams<ConsumerTabParamList>;
  CafeDetail: { cafeId: string };
  MenuItemDetail: { cafeId: string; menuItemId: string };
  BuyCredits: undefined;
  CreditHistory: undefined;
  OrderDetail: { orderId: string };
  RedemptionActive: {
    orderId: string;
    menuItemName: string;
    cafeName: string;
    creditAmount: number;
    backupCode: string;
    expiresAt: string; // ISO string
  };
};

// ─── Cafe Tabs ───────────────────────────────────────────

export type CafeTabParamList = {
  Dashboard: undefined;
  Redeem: undefined;
  Menu: undefined;
  Reports: undefined;
  Settings: undefined;
};

// ─── Root Stack ──────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  CafeOnboarding: NavigatorScreenParams<CafeOnboardingStackParamList>;
  ConsumerApp: NavigatorScreenParams<ConsumerStackParamList>;
  CafeApp: NavigatorScreenParams<CafeTabParamList>;
};

// ─── Screen Props Helpers ────────────────────────────────

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type CafeOnboardingScreenProps<T extends keyof CafeOnboardingStackParamList> =
  NativeStackScreenProps<CafeOnboardingStackParamList, T>;

export type ConsumerTabScreenProps<T extends keyof ConsumerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<ConsumerTabParamList, T>,
    NativeStackScreenProps<ConsumerStackParamList>
  >;

export type ConsumerStackScreenProps<T extends keyof ConsumerStackParamList> =
  NativeStackScreenProps<ConsumerStackParamList, T>;

export type CafeScreenProps<T extends keyof CafeTabParamList> =
  BottomTabScreenProps<CafeTabParamList, T>;

// Keep the old type for backward compat
export type ConsumerScreenProps<T extends keyof ConsumerTabParamList> =
  ConsumerTabScreenProps<T>;

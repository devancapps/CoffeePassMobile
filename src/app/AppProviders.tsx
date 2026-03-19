import React, { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { USE_STRIPE_PAYMENTS, STRIPE_PUBLISHABLE_KEY, MERCHANT_IDENTIFIER } from '@/config/stripe';

// Conditionally import StripeProvider — not available in Expo Go (requires native modules).
// When USE_STRIPE_PAYMENTS=false the wrapper is a no-op passthrough.
let StripeProviderWrapper: React.FC<{ children: ReactNode }>;

if (USE_STRIPE_PAYMENTS) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { StripeProvider } = require('@stripe/stripe-react-native') as {
    StripeProvider: React.FC<{
      publishableKey: string;
      merchantIdentifier?: string;
      children: ReactNode;
    }>;
  };
  StripeProviderWrapper = ({ children }) => (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier={MERCHANT_IDENTIFIER}
    >
      {children}
    </StripeProvider>
  );
} else {
  StripeProviderWrapper = ({ children }) => <>{children}</>;
}

/**
 * AppProviders
 *
 * Wraps the entire application in required context providers.
 * Order matters:
 *   SafeAreaProvider → StripeProvider → AuthProvider → NavigationContainer → ToastProvider
 *
 * StripeProvider must be at the top level (outside nav) for Payment Sheet to work.
 * ToastProvider must be inside NavigationContainer for insets + nav access.
 */
interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <StripeProviderWrapper>
        <AuthProvider>
          <NavigationContainer>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NavigationContainer>
        </AuthProvider>
      </StripeProviderWrapper>
    </SafeAreaProvider>
  );
};

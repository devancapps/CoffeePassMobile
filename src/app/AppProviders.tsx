import React, { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * AppProviders
 *
 * Wraps the entire application in required context providers.
 * Order matters:
 *   SafeAreaProvider → AuthProvider → NavigationContainer → ToastProvider
 *
 * ToastProvider must be inside NavigationContainer so it renders
 * above the nav layer, and inside SafeAreaProvider for insets.
 */
interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

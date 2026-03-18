import React, { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/context/AuthContext';

/**
 * AppProviders
 *
 * Wraps the entire application in required context providers.
 * Order matters:
 *   SafeAreaProvider → AuthProvider → NavigationContainer
 *
 * NavigationContainer must be inside SafeAreaProvider
 * for proper safe area detection on all devices.
 */
interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

import { useContext } from 'react';
import { AuthContext, AuthContextValue } from '@/features/auth/context/AuthContext';

/**
 * Hook to access auth state and actions.
 *
 * Must be used within an AuthProvider.
 * Throws if used outside the provider tree.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app in <AuthProvider> in AppProviders.tsx.'
    );
  }
  return context;
}

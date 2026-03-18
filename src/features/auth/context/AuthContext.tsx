import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/models';
import { UserRole } from '@/config/constants';
import * as authService from '@/services/firebase/auth';

// ─── Configuration ───────────────────────────────────────

/**
 * Toggle between real Firebase Auth and local mock auth.
 * Set to true once Firebase project credentials are configured.
 */
const USE_FIREBASE_AUTH = false;

// ─── Types ───────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  setUserRole: (role: UserRole) => Promise<void>;
  completeOnboarding: () => void;
  /** Update the user's credit balance (mock mode: in-memory + storage) */
  updateCreditBalance: (delta: number) => Promise<void>;
  /** DEV ONLY: Switch between consumer / cafe_owner for testing */
  switchRole: (role: UserRole.CONSUMER | UserRole.CAFE_OWNER) => void;
}

// ─── Reducer ─────────────────────────────────────────────

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_NEEDS_ONBOARDING'; payload: boolean }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_NEEDS_ONBOARDING':
      return { ...state, needsOnboarding: action.payload };
    case 'LOGOUT':
      return { user: null, isLoading: false, error: null, needsOnboarding: false };
    default:
      return state;
  }
}

// ─── Storage Keys ────────────────────────────────────────

const AUTH_STORAGE_KEY = '@coffeepass_auth_user';
const ONBOARDING_KEY = '@coffeepass_onboarding_complete';

// ─── Context ─────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    error: null,
    needsOnboarding: false,
  });

  useEffect(() => {
    if (USE_FIREBASE_AUTH) {
      return initFirebaseAuth();
    } else {
      restoreMockSession();
      return undefined;
    }
  }, []);

  // ─── Firebase Auth Mode ──────────────────────────────

  function initFirebaseAuth(): () => void {
    const unsubscribe = authService.subscribeToAuthState(async (user) => {
      if (user) {
        await persistUser(user);
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY + '_' + user.id);
        dispatch({ type: 'SET_NEEDS_ONBOARDING', payload: !onboardingDone && user.role === UserRole.CAFE_OWNER });
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    });
    return unsubscribe;
  }

  // ─── Mock Auth Mode ──────────────────────────────────

  async function restoreMockSession(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        user.createdAt = new Date(user.createdAt);
        user.updatedAt = new Date(user.updatedAt);

        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY + '_' + user.id);
        dispatch({ type: 'SET_NEEDS_ONBOARDING', payload: !onboardingDone && user.role === UserRole.CAFE_OWNER });
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function persistUser(user: User): Promise<void> {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  // ─── Auth Actions ────────────────────────────────────

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      if (USE_FIREBASE_AUTH) {
        // Real Firebase — the auth state listener handles the user update
        await authService.signInWithEmail(email, password);
      } else {
        // Mock mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (!email || !password) throw new Error('Email and password are required');
        if (password.length < 8) throw new Error('Invalid email or password');

        const mockUser: User = {
          id: `user_${Date.now()}`,
          email: email.toLowerCase().trim(),
          displayName: email.split('@')[0],
          role: UserRole.CONSUMER,
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          authProvider: 'email',
        };
        await persistUser(mockUser);
        dispatch({ type: 'SET_USER', payload: mockUser });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.CONSUMER,
  ): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      if (USE_FIREBASE_AUTH) {
        await authService.signUpWithEmail(email, password, name, role);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (!email || !password || !name) throw new Error('All fields are required');

        const mockUser: User = {
          id: `user_${Date.now()}`,
          email: email.toLowerCase().trim(),
          displayName: name.trim(),
          role,
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          authProvider: 'email',
        };

        if (role === UserRole.CAFE_OWNER) {
          dispatch({ type: 'SET_NEEDS_ONBOARDING', payload: true });
        }
        await persistUser(mockUser);
        dispatch({ type: 'SET_USER', payload: mockUser });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const logout = async (): Promise<void> => {
    if (USE_FIREBASE_AUTH) {
      await authService.signOut();
    }
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (USE_FIREBASE_AUTH) {
      await authService.sendPasswordReset(email);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Set the user's role. Used after the role selection screen.
   */
  const setUserRole = async (role: UserRole): Promise<void> => {
    if (!state.user) return;

    if (USE_FIREBASE_AUTH) {
      await authService.updateUserRole(state.user.id, role);
    }

    const updatedUser: User = { ...state.user, role, updatedAt: new Date() };

    if (role === UserRole.CAFE_OWNER) {
      dispatch({ type: 'SET_NEEDS_ONBOARDING', payload: true });
    }
    await persistUser(updatedUser);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  /**
   * Mark onboarding as complete for the current user.
   */
  const completeOnboarding = async (): Promise<void> => {
    if (state.user) {
      await AsyncStorage.setItem(ONBOARDING_KEY + '_' + state.user.id, 'true');
    }
    dispatch({ type: 'SET_NEEDS_ONBOARDING', payload: false });
  };

  /**
   * Update the current user's credit balance by delta.
   * Positive = add credits, negative = deduct credits.
   */
  const updateCreditBalance = async (delta: number): Promise<void> => {
    if (!state.user) return;
    const newBalance = Math.max(0, (state.user.creditBalance ?? 0) + delta);
    const updatedUser: User = { ...state.user, creditBalance: newBalance, updatedAt: new Date() };
    await persistUser(updatedUser);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  /**
   * DEV ONLY: Switch role for testing navigation flows.
   */
  const switchRole = (role: UserRole.CONSUMER | UserRole.CAFE_OWNER): void => {
    if (!state.user) return;
    const updatedUser: User = { ...state.user, role, updatedAt: new Date() };
    persistUser(updatedUser);
    dispatch({ type: 'SET_NEEDS_ONBOARDING', payload: false });
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        error: state.error,
        needsOnboarding: state.needsOnboarding,
        login,
        signup,
        logout,
        resetPassword,
        clearError,
        setUserRole,
        completeOnboarding,
        updateCreditBalance,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Toast Notification System
 *
 * Provides a lightweight, animated toast banner that slides in
 * from the top. Supports success, error, warning, and info variants.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Credits purchased!', 'success');
 */

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/config/theme';

// ─── Types ────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

// ─── Context ──────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ─── Hook ─────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Toast Config ─────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  success: {
    bg: Colors.success,
    icon: 'checkmark-circle',
    iconColor: Colors.white,
  },
  error: {
    bg: Colors.error,
    icon: 'alert-circle',
    iconColor: Colors.white,
  },
  warning: {
    bg: Colors.warning,
    icon: 'warning',
    iconColor: Colors.white,
  },
  info: {
    bg: Colors.caramel,
    icon: 'information-circle',
    iconColor: Colors.white,
  },
};

// ─── Toast Banner ─────────────────────────────────────────

interface ToastBannerProps {
  toast: Toast;
  topInset: number;
}

const ToastBanner: React.FC<ToastBannerProps> = ({ toast, topInset }) => {
  const slideY = useRef(new Animated.Value(-120)).current;
  const config = VARIANT_CONFIG[toast.variant];

  React.useEffect(() => {
    // Slide in
    Animated.spring(slideY, {
      toValue: topInset + Spacing.sm,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    // Slide out after 3s
    const timer = setTimeout(() => {
      Animated.timing(slideY, {
        toValue: -120,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: config.bg, transform: [{ translateY: slideY }] },
        Shadows.md as object,
      ]}
    >
      <Ionicons name={config.icon} size={22} color={config.iconColor} style={styles.icon} />
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
};

// ─── Provider ─────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);

    // Auto-remove after animation completes (3s display + 0.3s fade out)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast layer — rendered above everything */}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((toast) => (
          <ToastBanner key={toast.id} toast={toast} topInset={insets.top} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  banner: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 52,
  },
  icon: {
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.white,
    lineHeight: 20,
  },
});

/**
 * Haptic Feedback Utility
 *
 * Thin wrapper around expo-haptics with graceful fallback on
 * platforms that don't support haptics (web, simulators).
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  /** Subtle tap — for selection changes, toggles */
  light: (): void => {
    if (!isNative) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  /** Medium tap — for button presses, navigation */
  medium: (): void => {
    if (!isNative) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  /** Strong tap — for confirmations, submissions */
  heavy: (): void => {
    if (!isNative) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },

  /** Success pattern — credit purchase, order created, redemption success */
  success: (): void => {
    if (!isNative) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  /** Error pattern — failed redemption, payment failure */
  error: (): void => {
    if (!isNative) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },

  /** Warning pattern — token expiring, low balance */
  warning: (): void => {
    if (!isNative) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },

  /** Subtle tick — for filter changes, list scrolling */
  selection: (): void => {
    if (!isNative) return;
    Haptics.selectionAsync().catch(() => {});
  },
};

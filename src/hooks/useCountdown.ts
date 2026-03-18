/**
 * useCountdown Hook
 *
 * Provides a live countdown timer for redemption tokens.
 * Updates every second. Returns formatted time and expired state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownResult {
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Formatted as "MM:SS" */
  formatted: string;
  /** Whether the countdown has expired */
  isExpired: boolean;
  /** Percentage remaining (1.0 → 0.0) */
  progress: number;
}

export function useCountdown(expiresAt: Date, totalSeconds: number = 900): UseCountdownResult {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isExpired = remainingSeconds <= 0;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

  return { remainingSeconds, formatted, isExpired, progress };
}

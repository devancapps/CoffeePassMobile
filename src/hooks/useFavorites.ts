/**
 * useFavorites Hook
 *
 * Persists favorite cafe IDs to AsyncStorage, scoped per user.
 * Returns helpers to toggle, check, and list favorites.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';
import { haptics } from '@/utils/haptics';

const FAVORITES_BASE_KEY = '@coffeepass_favorites';

export interface UseFavoritesResult {
  favoriteIds: string[];
  isFavorite: (cafeId: string) => boolean;
  toggleFavorite: (cafeId: string) => Promise<void>;
  isLoaded: boolean;
}

export function useFavorites(): UseFavoritesResult {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Scope favorites to the logged-in user
  const storageKey = user
    ? `${FAVORITES_BASE_KEY}_${user.id}`
    : FAVORITES_BASE_KEY;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (!cancelled) {
          setFavoriteIds(stored ? (JSON.parse(stored) as string[]) : []);
        }
      } catch {
        if (!cancelled) setFavoriteIds([]);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    setIsLoaded(false);
    load();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const isFavorite = useCallback(
    (cafeId: string): boolean => favoriteIds.includes(cafeId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (cafeId: string): Promise<void> => {
      haptics.light();
      setFavoriteIds((prev) => {
        const next = prev.includes(cafeId)
          ? prev.filter((id) => id !== cafeId)
          : [...prev, cafeId];
        AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [storageKey],
  );

  return { favoriteIds, isFavorite, toggleFavorite, isLoaded };
}

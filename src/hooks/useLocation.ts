/**
 * useLocation Hook
 *
 * Manages device location permissions and current coordinates
 * using expo-location. Provides location state and permission
 * request flow per PRD Section 5.7.
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied' | 'restricted';

interface UseLocationResult {
  /** Current device coordinates (null if unavailable) */
  location: LocationCoords | null;
  /** Permission status */
  permissionStatus: LocationPermissionStatus;
  /** Whether location is currently being fetched */
  isLoading: boolean;
  /** Error message if location fetch failed */
  error: string | null;
  /** Request location permission and fetch position */
  requestPermission: () => Promise<boolean>;
  /** Refresh current location */
  refreshLocation: () => Promise<void>;
}

// Default fallback: downtown San Francisco
const DEFAULT_LOCATION: LocationCoords = {
  latitude: 37.7749,
  longitude: -122.4194,
};

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      // Use default location as fallback
      setLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const mapped = mapPermissionStatus(status);
      setPermissionStatus(mapped);

      if (mapped === 'granted') {
        await fetchLocation();
        return true;
      }

      // Use fallback location when denied
      setLocation(DEFAULT_LOCATION);
      setIsLoading(false);
      return false;
    } catch {
      setPermissionStatus('denied');
      setLocation(DEFAULT_LOCATION);
      setIsLoading(false);
      return false;
    }
  }, [fetchLocation]);

  const refreshLocation = useCallback(async () => {
    if (permissionStatus === 'granted') {
      await fetchLocation();
    }
  }, [permissionStatus, fetchLocation]);

  // Check existing permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const mapped = mapPermissionStatus(status);
        setPermissionStatus(mapped);

        if (mapped === 'granted') {
          await fetchLocation();
        } else {
          setLocation(DEFAULT_LOCATION);
          setIsLoading(false);
        }
      } catch {
        setLocation(DEFAULT_LOCATION);
        setIsLoading(false);
      }
    })();
  }, [fetchLocation]);

  return {
    location,
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    refreshLocation,
  };
}

function mapPermissionStatus(status: Location.PermissionStatus): LocationPermissionStatus {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return 'granted';
    case Location.PermissionStatus.DENIED:
      return 'denied';
    case Location.PermissionStatus.UNDETERMINED:
    default:
      return 'undetermined';
  }
}

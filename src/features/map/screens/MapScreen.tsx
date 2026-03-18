/**
 * Map Screen (C12)
 *
 * Full-screen map with cafe pins and bottom preview cards.
 * PRD Section 5.1: MapKit-backed map with custom pins,
 * search bar, and horizontally scrollable cafe preview cards.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { useLocation } from '@/hooks/useLocation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MOCK_CAFES } from '@/data/mockCafes';
import { calculateDistance, isCafeOpen, isClosingSoon, getTodayHoursString } from '@/utils/cafe';
import { formatDistance } from '@/utils/formatting';
import type { ConsumerStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<ConsumerStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = Spacing.sm;

// ─── Component ───────────────────────────────────────────

export const MapScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { location, permissionStatus, requestPermission } = useLocation();
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);

  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Calculate distances and sort
  const cafesWithDistance = useMemo(() => {
    if (!location) return [];
    return MOCK_CAFES.map((cafe) => ({
      cafe,
      distance: calculateDistance(location, cafe.location),
    })).sort((a, b) => a.distance - b.distance);
  }, [location]);

  const initialRegion: Region | undefined = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : undefined;

  const handleMarkerPress = useCallback(
    (cafeId: string) => {
      setSelectedCafeId(cafeId);
      const idx = cafesWithDistance.findIndex((c) => c.cafe.id === cafeId);
      if (idx >= 0 && listRef.current) {
        listRef.current.scrollToIndex({ index: idx, animated: true });
      }
    },
    [cafesWithDistance]
  );

  const handleCardPress = useCallback(
    (cafeId: string) => {
      navigation.navigate('CafeDetail', { cafeId });
    },
    [navigation]
  );

  const handleRecenter = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [location]);

  // Request location on mount if undetermined
  useEffect(() => {
    if (permissionStatus === 'undetermined') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  if (!location || !initialRegion) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading map..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
      >
        {cafesWithDistance.map(({ cafe }) => {
          const isOpen = isCafeOpen(cafe.hours);
          const isSelected = selectedCafeId === cafe.id;

          return (
            <Marker
              key={cafe.id}
              coordinate={{
                latitude: cafe.location.latitude,
                longitude: cafe.location.longitude,
              }}
              onPress={() => handleMarkerPress(cafe.id)}
              title={cafe.name}
            >
              <View
                style={[
                  styles.pin,
                  isSelected && styles.pinSelected,
                  !isOpen && styles.pinClosed,
                ]}
              >
                <Ionicons
                  name="cafe"
                  size={isSelected ? 18 : 14}
                  color={Colors.white}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Recenter Button */}
      <TouchableOpacity
        style={[styles.recenterButton, Shadows.md as object]}
        onPress={handleRecenter}
      >
        <Ionicons name="locate" size={22} color={Colors.espresso} />
      </TouchableOpacity>

      {/* Bottom Preview Cards */}
      <View style={styles.cardContainer}>
        <FlatList
          ref={listRef}
          data={cafesWithDistance}
          keyExtractor={(item) => item.cafe.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.cardListContent}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => {
            const { cafe, distance } = item;
            const isOpen = isCafeOpen(cafe.hours);
            const closingSoon = isClosingSoon(cafe.hours);

            return (
              <TouchableOpacity
                style={[
                  styles.previewCard,
                  Shadows.lg as object,
                  selectedCafeId === cafe.id && styles.previewCardSelected,
                ]}
                onPress={() => handleCardPress(cafe.id)}
                activeOpacity={0.9}
              >
                <View style={styles.previewImageContainer}>
                  <Ionicons name="cafe" size={24} color={Colors.caramelMuted} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {cafe.name}
                  </Text>
                  <View style={styles.previewMetaRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.gray500} />
                    <Text style={styles.previewMeta}>{formatDistance(distance)}</Text>
                    <Text style={styles.previewDot}>·</Text>
                    <Text
                      style={[
                        styles.previewStatus,
                        isOpen
                          ? closingSoon
                            ? styles.statusClosing
                            : styles.statusOpen
                          : styles.statusClosed,
                      ]}
                    >
                      {isOpen ? (closingSoon ? 'Closes Soon' : 'Open') : 'Closed'}
                    </Text>
                  </View>
                  <Text style={styles.previewHours} numberOfLines={1}>
                    {getTodayHoursString(cafe.hours)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.caramel,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  pinSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.espresso,
    borderWidth: 3,
  },
  pinClosed: {
    backgroundColor: Colors.gray500,
  },
  recenterButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 180,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
  },
  cardListContent: {
    paddingHorizontal: Spacing.lg,
    gap: CARD_SPACING,
  },
  previewCard: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  previewCardSelected: {
    borderWidth: 2,
    borderColor: Colors.caramel,
  },
  previewImageContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  previewName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: 2,
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  previewMeta: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  previewDot: {
    color: Colors.gray300,
    fontSize: Typography.size.xs,
  },
  previewStatus: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
  },
  previewHours: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  statusOpen: {
    color: Colors.success,
  },
  statusClosing: {
    color: Colors.warning,
  },
  statusClosed: {
    color: Colors.error,
  },
});

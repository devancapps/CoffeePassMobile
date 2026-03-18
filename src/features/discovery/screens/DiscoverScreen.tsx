/**
 * Discover Screen (C06)
 *
 * Browse nearby cafes in list view with search and filters.
 * PRD Section 5.2: Vertically scrollable cafe cards sorted
 * by distance, with search and filter capabilities.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { CafeCard } from '@/components/CafeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useLocation } from '@/hooks/useLocation';
import { MOCK_CAFES, MOCK_MENU_ITEMS } from '@/data/mockCafes';
import { calculateDistance, isCafeOpen, getMenuPreview, getAverageCreditPrice, getPriceTier } from '@/utils/cafe';
import type { ConsumerStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<ConsumerStackParamList>;

// ─── Filter Types ────────────────────────────────────────

type DistanceFilter = 0.5 | 1 | 3 | 5 | 10;
type PriceFilter = '$' | '$$' | '$$$' | 'all';

interface Filters {
  openNow: boolean;
  distance: DistanceFilter;
  price: PriceFilter;
}

const DISTANCE_OPTIONS: DistanceFilter[] = [0.5, 1, 3, 5, 10];
const PRICE_OPTIONS: { label: string; value: PriceFilter }[] = [
  { label: 'All', value: 'all' },
  { label: '$', value: '$' },
  { label: '$$', value: '$$' },
  { label: '$$$', value: '$$$' },
];

const DEFAULT_FILTERS: Filters = {
  openNow: false,
  distance: 3,
  price: 'all',
};

// ─── Component ───────────────────────────────────────────

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { location, permissionStatus, requestPermission } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate distances for all cafes
  const cafesWithDistance = useMemo(() => {
    if (!location) return [];

    return MOCK_CAFES.map((cafe) => ({
      cafe,
      distance: calculateDistance(location, cafe.location),
      menuItems: MOCK_MENU_ITEMS[cafe.id] ?? [],
    })).sort((a, b) => a.distance - b.distance);
  }, [location]);

  // Apply search and filters
  const filteredCafes = useMemo(() => {
    let results = cafesWithDistance;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(({ cafe, menuItems }) => {
        const nameMatch = cafe.name.toLowerCase().includes(q);
        const menuMatch = menuItems.some((item) =>
          item.name.toLowerCase().includes(q)
        );
        return nameMatch || menuMatch;
      });
    }

    // Open now filter
    if (filters.openNow) {
      results = results.filter(({ cafe }) => isCafeOpen(cafe.hours));
    }

    // Distance filter
    results = results.filter(({ distance }) => distance <= filters.distance);

    // Price filter
    if (filters.price !== 'all') {
      results = results.filter(({ menuItems }) => {
        const prices = menuItems.map((m) => m.creditPrice);
        const avg = getAverageCreditPrice(prices);
        return getPriceTier(avg) === filters.price;
      });
    }

    return results;
  }, [cafesWithDistance, searchQuery, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.openNow) count++;
    if (filters.distance !== DEFAULT_FILTERS.distance) count++;
    if (filters.price !== DEFAULT_FILTERS.price) count++;
    return count;
  }, [filters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // In production, refetch from Firestore
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleCafePress = useCallback(
    (cafeId: string) => {
      navigation.navigate('CafeDetail', { cafeId });
    },
    [navigation]
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Request location on mount if needed
  useEffect(() => {
    if (permissionStatus === 'undetermined') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  if (!location) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner message="Finding nearby cafes..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()} ☕</Text>
        <Text style={styles.title}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.gray300} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cafes or drinks..."
            placeholderTextColor={Colors.gray300}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.gray300} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? Colors.caramel : Colors.espresso}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Open Now Toggle */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filters.openNow && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilters((f) => ({ ...f, openNow: !f.openNow }))
              }
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={filters.openNow ? Colors.caramel : Colors.gray500}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filters.openNow && styles.filterChipTextActive,
                ]}
              >
                Open Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Distance */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Distance</Text>
            <View style={styles.filterChipRow}>
              {DISTANCE_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.filterChip,
                    filters.distance === d && styles.filterChipActive,
                  ]}
                  onPress={() => setFilters((f) => ({ ...f, distance: d }))}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.distance === d && styles.filterChipTextActive,
                    ]}
                  >
                    {d} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Price</Text>
            <View style={styles.filterChipRow}>
              {PRICE_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.filterChip,
                    filters.price === p.value && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilters((f) => ({ ...f, price: p.value }))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.price === p.value && styles.filterChipTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setFilters(DEFAULT_FILTERS)}
            >
              <Text style={styles.resetText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filteredCafes.length} cafe{filteredCafes.length !== 1 ? 's' : ''} nearby
        </Text>
        {searchQuery.length > 0 && (
          <Text style={styles.searchingFor}>
            for &quot;{searchQuery}&quot;
          </Text>
        )}
      </View>

      {/* Cafe List */}
      <FlatList
        data={filteredCafes}
        keyExtractor={(item) => item.cafe.id}
        renderItem={({ item }) => {
          const menuCategories = [
            ...new Set(item.menuItems.map((m) => m.category)),
          ];
          return (
            <CafeCard
              cafe={item.cafe}
              distance={item.distance}
              menuPreview={getMenuPreview(menuCategories)}
              onPress={() => handleCafePress(item.cafe.id)}
            />
          );
        }}
        contentContainerStyle={[
          styles.listContent,
          filteredCafes.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.caramel}
          />
        }
        ListEmptyComponent={
          searchQuery.length > 0 ? (
            <EmptyState
              icon="search-outline"
              title={`No results for "${searchQuery}"`}
              subtitle="Try a different search or adjust your filters"
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <EmptyState
              icon="cafe-outline"
              title="No cafes found nearby"
              subtitle="Try expanding your search distance or check back soon"
              actionLabel="Expand Search"
              onAction={() => setFilters((f) => ({ ...f, distance: 10 }))}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  greeting: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Shadows.sm as object,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginLeft: Spacing.sm,
    height: '100%',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm as object,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.caramel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontFamily: Typography.family.bold,
    fontSize: 10,
    color: Colors.white,
  },
  filterPanel: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.md as object,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    borderColor: Colors.caramel,
    backgroundColor: Colors.caramel + '12',
  },
  filterChipText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  filterChipTextActive: {
    color: Colors.caramel,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resetText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  resultsText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  searchingFor: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});

/**
 * Cafe Detail Screen (C07)
 *
 * Full cafe info: hero image, name, status, description, menu,
 * hours, and mini-map with "Get Directions" link.
 * PRD Section 5.4.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useLocation } from '@/hooks/useLocation';
import { getMockCafe, getMockMenuItems } from '@/data/mockCafes';
import {
  isCafeOpen,
  isClosingSoon,
  getTodayHoursString,
  getWeeklySchedule,
  calculateDistance,
} from '@/utils/cafe';
import { formatDistance, formatCredits } from '@/utils/formatting';
import type { MenuItem } from '@/models';
import type { ConsumerStackScreenProps } from '@/navigation/types';

// ─── Component ───────────────────────────────────────────

export const CafeDetailScreen: React.FC<ConsumerStackScreenProps<'CafeDetail'>> = ({
  route,
  navigation,
}) => {
  const { cafeId } = route.params;
  const { location } = useLocation();
  const [showAllHours, setShowAllHours] = useState(false);

  const cafe = useMemo(() => getMockCafe(cafeId), [cafeId]);
  const menuItems = useMemo(() => getMockMenuItems(cafeId), [cafeId]);

  const distance = useMemo(() => {
    if (!location || !cafe) return undefined;
    return calculateDistance(location, cafe.location);
  }, [location, cafe]);

  // Group menu items by category
  const menuSections = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      const cat = item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return Object.entries(grouped).map(([category, data]) => ({
      title: category.charAt(0).toUpperCase() + category.slice(1),
      data,
    }));
  }, [menuItems]);

  const weeklySchedule = useMemo(
    () => (cafe ? getWeeklySchedule(cafe.hours) : []),
    [cafe]
  );

  const handleGetDirections = useCallback(() => {
    if (!cafe) return;
    const { latitude, longitude } = cafe.location;
    const url = Platform.select({
      ios: `maps:0,0?q=${cafe.name}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${cafe.name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url);
  }, [cafe]);

  const handleMenuItemPress = useCallback(
    (menuItemId: string) => {
      navigation.navigate('MenuItemDetail', { cafeId, menuItemId });
    },
    [navigation, cafeId]
  );

  if (!cafe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.gray300} />
          <Text style={styles.errorText}>Cafe not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const isOpen = isCafeOpen(cafe.hours);
  const closingSoon = isClosingSoon(cafe.hours);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Placeholder */}
        <View style={styles.hero}>
          <Ionicons name="cafe" size={64} color={Colors.caramelMuted} />
          <Text style={styles.heroText}>Cafe Photo</Text>

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, Shadows.md as object]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.espresso} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Name & Status */}
          <View style={styles.titleRow}>
            <Text style={styles.cafeName}>{cafe.name}</Text>
            <Badge
              label={isOpen ? (closingSoon ? 'Closes Soon' : 'Open Now') : 'Closed'}
              variant={isOpen ? (closingSoon ? 'warning' : 'success') : 'error'}
            />
          </View>

          {/* Quick Info Row */}
          <View style={styles.quickInfo}>
            {distance !== undefined && (
              <View style={styles.quickItem}>
                <Ionicons name="location-outline" size={16} color={Colors.gray500} />
                <Text style={styles.quickText}>{formatDistance(distance)}</Text>
              </View>
            )}
            <View style={styles.quickItem}>
              <Ionicons name="time-outline" size={16} color={Colors.gray500} />
              <Text style={styles.quickText}>{getTodayHoursString(cafe.hours)}</Text>
            </View>
            <View style={styles.quickItem}>
              <Ionicons name="restaurant-outline" size={16} color={Colors.gray500} />
              <Text style={styles.quickText}>{menuItems.length} items</Text>
            </View>
          </View>

          {/* Description */}
          {cafe.description ? (
            <Text style={styles.description}>{cafe.description}</Text>
          ) : null}

          {/* Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu</Text>
            {menuSections.map((section) => (
              <View key={section.title} style={styles.menuSection}>
                <Text style={styles.menuCategoryTitle}>{section.title}</Text>
                {section.data.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      {item.description ? (
                        <Text style={styles.menuItemDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.menuItemPrice}>
                      <Text style={styles.priceText}>{item.creditPrice}</Text>
                      <Text style={styles.priceLabel}>credits</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Hours Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.hoursHeader}
              onPress={() => setShowAllHours(!showAllHours)}
            >
              <Text style={styles.sectionTitle}>Hours</Text>
              <Ionicons
                name={showAllHours ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.gray500}
              />
            </TouchableOpacity>

            {showAllHours ? (
              weeklySchedule.map((day) => (
                <View
                  key={day.day}
                  style={[styles.hoursRow, day.isToday && styles.hoursRowToday]}
                >
                  <Text
                    style={[styles.hoursDay, day.isToday && styles.hoursDayToday]}
                  >
                    {day.day}
                  </Text>
                  <Text
                    style={[
                      styles.hoursTime,
                      day.hours === 'Closed' && styles.hoursTimeClosed,
                      day.isToday && styles.hoursTimeToday,
                    ]}
                  >
                    {day.hours}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDayToday}>Today</Text>
                <Text style={styles.hoursTimeToday}>
                  {getTodayHoursString(cafe.hours)}
                </Text>
              </View>
            )}
          </View>

          {/* Location + Directions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.addressText}>
              {cafe.address.street}, {cafe.address.city}, {cafe.address.state}{' '}
              {cafe.address.zipCode}
            </Text>

            {/* Mini Map */}
            <View style={styles.miniMapContainer}>
              <MapView
                style={styles.miniMap}
                provider={PROVIDER_DEFAULT}
                initialRegion={{
                  latitude: cafe.location.latitude,
                  longitude: cafe.location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: cafe.location.latitude,
                    longitude: cafe.location.longitude,
                  }}
                >
                  <View style={styles.miniMapPin}>
                    <Ionicons name="cafe" size={14} color={Colors.white} />
                  </View>
                </Marker>
              </MapView>
            </View>

            <Button
              title="Get Directions"
              onPress={handleGetDirections}
              variant="outline"
              icon="navigate-outline"
              fullWidth
            />
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(`tel:${cafe.phone}`)}
            >
              <Ionicons name="call-outline" size={20} color={Colors.caramel} />
              <Text style={styles.contactText}>{cafe.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.gray500,
  },
  hero: {
    height: 220,
    backgroundColor: Colors.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray300,
    marginTop: Spacing.sm,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cafeName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    flex: 1,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  description: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray700,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.md,
  },
  menuSection: {
    marginBottom: Spacing.md,
  },
  menuCategoryTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.caramel,
    marginBottom: Spacing.sm,
    textTransform: 'capitalize',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  menuItemName: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  menuItemDesc: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  menuItemPrice: {
    alignItems: 'center',
    minWidth: 50,
  },
  priceText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.caramel,
  },
  priceLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  hoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  hoursRowToday: {
    backgroundColor: Colors.caramel + '08',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
  },
  hoursDay: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  hoursDayToday: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  hoursTime: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray700,
  },
  hoursTimeClosed: {
    color: Colors.error,
  },
  hoursTimeToday: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  addressText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray700,
    marginBottom: Spacing.md,
  },
  miniMapContainer: {
    height: 150,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  miniMapPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.caramel,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  contactText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.caramel,
  },
});

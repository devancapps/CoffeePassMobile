/**
 * CafeCard Component
 *
 * Reusable card for displaying a cafe in list views.
 * Shows photo placeholder, name, distance, open/closed status,
 * and a menu preview per PRD Section 5.2.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Badge } from './Badge';
import type { Cafe } from '@/models';
import { isCafeOpen, isClosingSoon, getTodayHoursString } from '@/utils/cafe';
import { formatDistance } from '@/utils/formatting';

interface CafeCardProps {
  cafe: Cafe;
  distance?: number; // miles
  onPress: () => void;
  style?: ViewStyle;
  menuPreview?: string;
}

export const CafeCard: React.FC<CafeCardProps> = ({
  cafe,
  distance,
  onPress,
  style,
  menuPreview,
}) => {
  const isOpen = isCafeOpen(cafe.hours);
  const closingSoon = isClosingSoon(cafe.hours);

  const statusLabel = isOpen
    ? closingSoon
      ? 'Closes Soon'
      : 'Open'
    : 'Closed';

  const statusVariant = isOpen
    ? closingSoon
      ? 'warning' as const
      : 'success' as const
    : 'error' as const;

  return (
    <TouchableOpacity
      style={[styles.container, Shadows.md as ViewStyle, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cafe Photo Placeholder */}
      <View style={styles.imageContainer}>
        <Ionicons name="cafe" size={28} color={Colors.caramelMuted} />
      </View>

      {/* Cafe Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {cafe.name}
          </Text>
          <Badge label={statusLabel} variant={statusVariant} />
        </View>

        <View style={styles.metaRow}>
          {distance !== undefined && (
            <>
              <Ionicons name="location-outline" size={14} color={Colors.gray500} />
              <Text style={styles.metaText}>{formatDistance(distance)}</Text>
              <Text style={styles.dot}>·</Text>
            </>
          )}
          <Ionicons name="time-outline" size={14} color={Colors.gray500} />
          <Text style={styles.metaText}>{getTodayHoursString(cafe.hours)}</Text>
        </View>

        {menuPreview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {menuPreview}
          </Text>
        ) : null}
      </View>

      {/* Chevron */}
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  metaText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  dot: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray300,
    marginHorizontal: 2,
  },
  preview: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
});

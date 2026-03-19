/**
 * Profile Screen (C17) — Phase 8 Rebuild
 *
 * Full consumer profile with:
 *   - Avatar + name/email
 *   - Stats row (orders, credits spent, balance)
 *   - Favorite cafes horizontal scroll
 *   - Account settings menu
 *   - Developer tools (DEV only)
 *   - Logout
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { UserRole, OrderStatus } from '@/config/constants';
import { MOCK_ORDERS } from '@/data/mockTransactions';
import { getMockCafe } from '@/data/mockCafes';
import { formatCredits } from '@/utils/formatting';
import type { ConsumerStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<ConsumerStackParamList>;

// ─── Sub-components ───────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface FavoriteCafeCardProps {
  cafeId: string;
  onPress: (cafeId: string) => void;
  onUnfavorite: (cafeId: string) => void;
}

const FavoriteCafeCard: React.FC<FavoriteCafeCardProps> = ({
  cafeId,
  onPress,
  onUnfavorite,
}) => {
  const cafe = useMemo(() => getMockCafe(cafeId), [cafeId]);

  if (!cafe) return null;

  return (
    <TouchableOpacity
      style={styles.favCard}
      onPress={() => onPress(cafeId)}
      activeOpacity={0.85}
    >
      {/* Cafe photo placeholder */}
      <View style={styles.favPhoto}>
        <Ionicons name="cafe" size={24} color={Colors.caramelMuted} />
      </View>

      {/* Unfavorite button */}
      <TouchableOpacity
        style={styles.favHeart}
        onPress={() => onUnfavorite(cafeId)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="heart" size={16} color={Colors.error} />
      </TouchableOpacity>

      <Text style={styles.favName} numberOfLines={2}>{cafe.name}</Text>
      <Text style={styles.favItems}>{cafe.menuItemCount} items</Text>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────

interface MenuRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user, logout, switchRole } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  // ── Compute stats from mock orders ──────────────────────
  const stats = useMemo(() => {
    const myOrders = MOCK_ORDERS; // In production: filter by user.id
    const totalOrders = myOrders.length;
    const creditsSpent = myOrders
      .filter((o) => o.status === OrderStatus.REDEEMED)
      .reduce((sum, o) => sum + o.creditAmount, 0);
    const balance = user?.creditBalance ?? 0;
    return { totalOrders, creditsSpent, balance };
  }, [user]);

  const handleCafePress = useCallback(
    (cafeId: string) => {
      navigation.navigate('CafeDetail', { cafeId });
    },
    [navigation],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ],
    );
  }, [logout]);

  const handleSwitchToCafe = useCallback(() => {
    switchRole(UserRole.CAFE_OWNER);
  }, [switchRole]);

  const accountMenuRows: MenuRow[] = [
    {
      icon: 'wallet-outline',
      label: 'Buy Credits',
      onPress: () => navigation.navigate('BuyCredits'),
    },
    {
      icon: 'receipt-outline',
      label: 'Credit History',
      onPress: () => navigation.navigate('CreditHistory'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () =>
        Alert.alert('Notifications', 'Notification settings coming soon.'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => Alert.alert('Help', 'Email us at support@coffeepass.app'),
    },
    {
      icon: 'document-text-outline',
      label: 'Terms of Service',
      onPress: () => Alert.alert('Terms', 'Terms of Service coming soon.'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      onPress: () => Alert.alert('Privacy', 'Privacy Policy coming soon.'),
    },
  ];

  // ── Initials for avatar ──────────────────────────────────
  const initials = useMemo(() => {
    const name = user?.displayName ?? 'G';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.displayName]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        {/* ── User Hero Card ──────────────────────────────── */}
        <Card padding="lg" style={styles.heroCard}>
          <View style={styles.heroRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.displayName}>{user?.displayName ?? 'Guest'}</Text>
              <Text style={styles.email}>{user?.email ?? ''}</Text>
              <Badge
                label={user?.role === UserRole.CAFE_OWNER ? 'Cafe Owner' : 'Coffee Lover'}
                variant="info"
              />
            </View>
          </View>
        </Card>

        {/* ── Stats Row ───────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            label="Orders"
            value={String(stats.totalOrders)}
            icon="bag-handle-outline"
            color={Colors.caramel}
          />
          <StatCard
            label="Spent"
            value={formatCredits(stats.creditsSpent)}
            icon="trending-down-outline"
            color={Colors.error}
          />
          <StatCard
            label="Balance"
            value={formatCredits(stats.balance)}
            icon="cafe-outline"
            color={Colors.success}
          />
        </View>

        {/* ── Favorite Cafes ──────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Cafes</Text>
            {favoriteIds.length > 0 && (
              <Text style={styles.sectionCount}>{favoriteIds.length}</Text>
            )}
          </View>

          {favoriteIds.length === 0 ? (
            <Card padding="md" style={styles.emptyFavCard}>
              <Ionicons name="heart-outline" size={32} color={Colors.gray300} />
              <Text style={styles.emptyFavText}>
                No favorites yet. Tap the heart on any cafe to save it here.
              </Text>
            </Card>
          ) : (
            <FlatList
              data={favoriteIds}
              keyExtractor={(id) => id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favList}
              renderItem={({ item }) => (
                <FavoriteCafeCard
                  cafeId={item}
                  onPress={handleCafePress}
                  onUnfavorite={toggleFavorite}
                />
              )}
            />
          )}
        </View>

        {/* ── Account Menu ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card padding="sm" style={styles.menuCard}>
          {accountMenuRows.map((row, index) => (
            <View key={row.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={row.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={row.icon} size={20} color={Colors.caramel} />
                </View>
                <Text style={styles.menuLabel}>{row.label}</Text>
                {row.badge ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{row.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={Colors.gray300} />
              </TouchableOpacity>
              {index < accountMenuRows.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </View>
          ))}
        </Card>

        {/* ── DEV: Role Switcher ──────────────────────────── */}
        {__DEV__ && (
          <>
            <Text style={[styles.sectionTitle, styles.devSectionTitle]}>
              Developer Tools
            </Text>
            <Card padding="md" style={styles.devCard}>
              <View style={styles.devHeader}>
                <Ionicons name="code-slash-outline" size={16} color={Colors.caramel} />
                <Text style={styles.devLabel}>
                  Current Role: {user?.role ?? 'none'}
                </Text>
              </View>
              <View style={styles.devActions}>
                <Button
                  title="Switch to Cafe Owner"
                  onPress={handleSwitchToCafe}
                  variant="outline"
                  size="sm"
                  fullWidth
                />
              </View>
            </Card>
          </>
        )}

        {/* ── Logout ──────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CoffeePass v1.0.0-beta</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Hero card
  heroCard: {
    marginBottom: Spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.caramel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.white,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  displayName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
  },
  email: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...(Shadows.sm as object),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    textAlign: 'center',
  },

  // Favorites
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
  },
  sectionCount: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
    backgroundColor: Colors.caramel + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  emptyFavCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  emptyFavText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  favList: {
    paddingRight: Spacing.lg,
  },
  favCard: {
    width: 120,
    marginRight: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...(Shadows.sm as object),
  },
  favPhoto: {
    width: '100%',
    height: 72,
    backgroundColor: Colors.creamDark,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  favHeart: {
    position: 'absolute',
    top: Spacing.sm + 4,
    right: Spacing.sm + 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Shadows.sm as object),
  },
  favName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.espresso,
    marginBottom: 2,
  },
  favItems: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },

  // Account menu
  menuCard: {
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.caramel + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  menuBadge: {
    backgroundColor: Colors.caramel,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.xs,
  },
  menuBadgeText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.white,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginHorizontal: Spacing.sm,
  },

  // Dev tools
  devSectionTitle: {
    color: Colors.caramel,
  },
  devCard: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.caramel,
    borderStyle: 'dashed',
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  devLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
  devActions: {
    gap: Spacing.sm,
  },

  // Logout
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.error,
  },

  version: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

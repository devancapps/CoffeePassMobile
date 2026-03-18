/**
 * Cafe Dashboard Screen (F01)
 *
 * Main hub for cafe owners. Shows today's KPIs,
 * real-time activity feed, weekly trends, and
 * quick actions for common tasks.
 * PRD Section 6.1: Revenue, orders, redemptions, activity.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import {
  getMockDashboardStats,
  getMockActivityFeed,
  getMockWeeklySummaries,
  formatTimeAgo,
  formatCentsToDollars,
} from '@/data/mockCafeDashboard';
import type { ActivityFeedItem } from '@/data/mockCafeDashboard';

// ─── Helpers ─────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getActivityIcon(type: ActivityFeedItem['type']): {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
} {
  switch (type) {
    case 'redemption':
      return { name: 'checkmark-circle', color: Colors.success, bg: Colors.successLight };
    case 'new_order':
      return { name: 'receipt', color: Colors.caramel, bg: Colors.caramelMuted + '25' };
    case 'expired':
      return { name: 'time', color: Colors.warning, bg: Colors.warningLight };
    case 'cancelled':
      return { name: 'close-circle', color: Colors.error, bg: Colors.errorLight };
  }
}

function getActivityLabel(type: ActivityFeedItem['type']): string {
  switch (type) {
    case 'redemption': return 'Redeemed';
    case 'new_order': return 'New Order';
    case 'expired': return 'Expired';
    case 'cancelled': return 'Cancelled';
  }
}

// ─── Component ───────────────────────────────────────────

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const stats = useMemo(() => getMockDashboardStats(), []);
  const activityFeed = useMemo(() => getMockActivityFeed(), []);
  const weeklySummaries = useMemo(() => getMockWeeklySummaries(), []);

  const renderActivityItem = useCallback((item: ActivityFeedItem) => {
    const icon = getActivityIcon(item.type);
    return (
      <View key={item.id} style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityTop}>
            <Text style={styles.activityCustomer}>{item.customerName}</Text>
            <Text style={styles.activityTime}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
          <Text style={styles.activityDescription}>
            {getActivityLabel(item.type)} • {item.menuItemName}
          </Text>
          <Text style={styles.activityCredits}>{item.creditAmount} credits</Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.cafeName}>
              {user?.displayName ?? 'Your Cafe'}
            </Text>
          </View>
          <Badge label="Open" variant="success" />
        </View>

        {/* Today's KPIs */}
        <Text style={styles.sectionTitle}>Today's Performance</Text>
        <View style={styles.kpiRow}>
          <Card padding="md" style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="cash-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.kpiValue}>
              {formatCentsToDollars(stats.todayRevenueCents)}
            </Text>
            <Text style={styles.kpiLabel}>Revenue</Text>
          </Card>
          <Card padding="md" style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: Colors.caramelMuted + '25' }]}>
              <Ionicons name="receipt-outline" size={20} color={Colors.caramel} />
            </View>
            <Text style={styles.kpiValue}>{stats.todayOrders}</Text>
            <Text style={styles.kpiLabel}>Orders</Text>
          </Card>
          <Card padding="md" style={styles.kpiCard}>
            <View style={[styles.kpiIconCircle, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="checkmark-done-outline" size={20} color={Colors.info} />
            </View>
            <Text style={styles.kpiValue}>{stats.todayRedemptions}</Text>
            <Text style={styles.kpiLabel}>Redeemed</Text>
          </Card>
        </View>

        {/* Weekly Trends */}
        <Text style={styles.sectionTitle}>Weekly Trends</Text>
        <Card padding="md" style={styles.trendCard}>
          {weeklySummaries.map((week, index) => {
            const maxOrders = Math.max(...weeklySummaries.map((w) => w.orderCount));
            const barWidth = maxOrders > 0 ? (week.orderCount / maxOrders) * 100 : 0;
            return (
              <View key={week.weekLabel} style={styles.trendRow}>
                <Text style={styles.trendLabel}>{week.weekLabel}</Text>
                <View style={styles.trendBarContainer}>
                  <View
                    style={[
                      styles.trendBar,
                      { width: `${barWidth}%` },
                      index === 0 ? styles.trendBarCurrent : undefined,
                    ]}
                  />
                </View>
                <Text style={styles.trendValue}>{week.orderCount}</Text>
              </View>
            );
          })}
        </Card>

        {/* Pending Payout */}
        <Card padding="lg" style={styles.payoutCard}>
          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutLabel}>Pending Payout</Text>
              <Text style={styles.payoutValue}>
                {formatCentsToDollars(stats.pendingPayoutCents)}
              </Text>
            </View>
            <View style={styles.payoutBadge}>
              <Ionicons name="wallet-outline" size={16} color={Colors.caramel} />
              <Text style={styles.payoutBadgeText}>Next Monday</Text>
            </View>
          </View>
          <View style={styles.payoutDetails}>
            <View style={styles.payoutDetail}>
              <Text style={styles.payoutDetailLabel}>Avg. order</Text>
              <Text style={styles.payoutDetailValue}>
                {stats.averageOrderCredits.toFixed(1)} credits
              </Text>
            </View>
            <View style={styles.payoutDetailDivider} />
            <View style={styles.payoutDetail}>
              <Text style={styles.payoutDetailLabel}>Repeat rate</Text>
              <Text style={styles.payoutDetailValue}>
                {Math.round(stats.repeatCustomerRate * 100)}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Activity Feed */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Badge label={`${activityFeed.length} items`} variant="info" />
        </View>

        <Card padding="md" style={styles.activityCard}>
          {activityFeed.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Ionicons name="receipt-outline" size={40} color={Colors.gray300} />
              <Text style={styles.emptyText}>No activity today</Text>
              <Text style={styles.emptySubtext}>
                Orders and redemptions will appear here
              </Text>
            </View>
          ) : (
            activityFeed.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderActivityItem(item)}
                {index < activityFeed.length - 1 && (
                  <View style={styles.activityDivider} />
                )}
              </React.Fragment>
            ))
          )}
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { label: 'Scan Code', icon: 'qr-code-outline' as const, color: Colors.caramel },
            { label: 'View Menu', icon: 'restaurant-outline' as const, color: Colors.espresso },
            { label: 'Reports', icon: 'bar-chart-outline' as const, color: Colors.success },
            { label: 'Settings', icon: 'settings-outline' as const, color: Colors.info },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginBottom: Spacing.xxs,
  },
  cafeName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
  },

  // Section
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },

  // KPIs
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
  },
  kpiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  kpiValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
  },
  kpiLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },

  // Weekly Trends
  trendCard: {
    marginBottom: Spacing.lg,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trendLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    width: 80,
  },
  trendBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.gray100,
    borderRadius: 6,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  trendBar: {
    height: '100%',
    backgroundColor: Colors.caramelMuted,
    borderRadius: 6,
  },
  trendBarCurrent: {
    backgroundColor: Colors.caramel,
  },
  trendValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    width: 28,
    textAlign: 'right',
  },

  // Payout
  payoutCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.espresso,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  payoutLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.caramelMuted,
    marginBottom: Spacing.xxs,
  },
  payoutValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.white,
  },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.espressoLight,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  payoutBadgeText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.caramelMuted,
  },
  payoutDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.espressoLight,
    paddingTop: Spacing.md,
  },
  payoutDetail: {
    flex: 1,
    alignItems: 'center',
  },
  payoutDetailDivider: {
    width: 1,
    backgroundColor: Colors.espressoLight,
  },
  payoutDetailLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.caramelMuted,
    marginBottom: Spacing.xxs,
  },
  payoutDetailValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.white,
  },

  // Activity Feed
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCard: {
    marginBottom: Spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCustomer: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  activityTime: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
  },
  activityDescription: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  activityCredits: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.caramel,
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginVertical: Spacing.xs,
  },

  // Empty
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray300,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm as object,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.espresso,
  },
});

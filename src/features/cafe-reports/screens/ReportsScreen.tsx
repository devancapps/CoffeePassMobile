/**
 * Cafe Reports Screen (F07)
 *
 * Transaction reports, payout history, and weekly
 * financial summaries for cafe owners.
 * PRD Section 6.4: Payout schedule, transaction reports, CSV export.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PayoutStatus, PLATFORM } from '@/config/constants';
import {
  getMockPayouts,
  getMockWeeklySummaries,
  getMockDashboardStats,
  getMockActivityFeed,
  formatCentsToDollars,
} from '@/data/mockCafeDashboard';
import { formatDate } from '@/utils/formatting';
import { generateTransactionCSV, generatePayoutCSV } from '@/utils/csvExport';

// ─── Helpers ─────────────────────────────────────────────

function getPayoutStatusBadge(status: PayoutStatus): { label: string; variant: 'success' | 'warning' | 'error' } {
  switch (status) {
    case PayoutStatus.COMPLETED:
      return { label: 'Paid', variant: 'success' };
    case PayoutStatus.PROCESSING:
      return { label: 'Processing', variant: 'warning' };
    case PayoutStatus.FAILED:
      return { label: 'Failed', variant: 'error' };
  }
}

// ─── Component ───────────────────────────────────────────

export const ReportsScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'payouts'>('overview');
  const stats = useMemo(() => getMockDashboardStats(), []);
  const weeklySummaries = useMemo(() => getMockWeeklySummaries(), []);
  const payouts = useMemo(() => getMockPayouts(), []);

  const totalPaidOut = useMemo(
    () => payouts.filter((p) => p.status === PayoutStatus.COMPLETED).reduce((sum, p) => sum + p.payoutAmountCents, 0),
    [payouts]
  );

  const totalPlatformFees = useMemo(
    () => payouts.reduce((sum, p) => sum + p.platformFeeCents, 0),
    [payouts]
  );

  const handleExportCSV = useCallback(async () => {
    try {
      const activityFeed = getMockActivityFeed();
      const csv = selectedTab === 'overview'
        ? generateTransactionCSV('My Cafe', activityFeed, payouts)
        : generatePayoutCSV('My Cafe', payouts);
      await Share.share({
        message: csv,
        title: `CoffeePass_${selectedTab === 'overview' ? 'Transactions' : 'Payouts'}_${new Date().toISOString().split('T')[0]}.csv`,
      });
    } catch (error) {
      if ((error as Error).message !== 'User dismissed the Share dialog') {
        Alert.alert('Export Failed', 'Unable to export CSV. Please try again.');
      }
    }
  }, [selectedTab, payouts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Financial overview and payout history</Text>

        {/* Tab Selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={selectedTab === 'overview' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onPress={() => setSelectedTab('overview')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="analytics-outline"
              size={18}
              color={selectedTab === 'overview' ? Colors.caramel : Colors.gray500}
            />
            <Text style={selectedTab === 'overview' ? { ...styles.tabText, ...styles.tabTextActive } : styles.tabText}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedTab === 'payouts' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onPress={() => setSelectedTab('payouts')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={selectedTab === 'payouts' ? Colors.caramel : Colors.gray500}
            />
            <Text style={selectedTab === 'payouts' ? { ...styles.tabText, ...styles.tabTextActive } : styles.tabText}>
              Payouts
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'overview' ? (
          <>
            {/* Revenue Summary */}
            <Card padding="lg" style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>This Week</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {formatCentsToDollars(stats.weekRevenueCents)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Revenue</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{stats.weekOrders}</Text>
                  <Text style={styles.summaryLabel}>Orders</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>
                    {formatCentsToDollars(stats.pendingPayoutCents)}
                  </Text>
                  <Text style={styles.summaryLabel}>Your Payout</Text>
                </View>
              </View>
            </Card>

            {/* Platform Fee Info */}
            <Card padding="md" style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
                <View style={styles.feeInfo}>
                  <Text style={styles.feeText}>
                    Platform fee: {Math.round(PLATFORM.STANDARD_FEE_RATE * 100)}% • You receive{' '}
                    {formatCentsToDollars(PLATFORM.STANDARD_PAYOUT_PER_CREDIT * 100)} per credit redeemed
                  </Text>
                </View>
              </View>
            </Card>

            {/* Weekly Breakdown */}
            <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
            {weeklySummaries.map((week) => (
              <Card key={week.weekLabel} padding="md" style={styles.weekCard}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekLabel}>{week.weekLabel}</Text>
                  <Text style={styles.weekRevenue}>
                    {formatCentsToDollars(week.payoutCents)}
                  </Text>
                </View>
                <View style={styles.weekDetails}>
                  <View style={styles.weekDetail}>
                    <Ionicons name="receipt-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.weekDetailText}>{week.orderCount} orders</Text>
                  </View>
                  <View style={styles.weekDetail}>
                    <Ionicons name="pricetag-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.weekDetailText}>{week.creditsRedeemed} credits</Text>
                  </View>
                  <View style={styles.weekDetail}>
                    <Ionicons name="cash-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.weekDetailText}>
                      {formatCentsToDollars(week.revenueCents)} gross
                    </Text>
                  </View>
                </View>
              </Card>
            ))}

            {/* Export */}
            <Card padding="md" style={styles.exportCard}>
              <View style={styles.exportRow}>
                <Ionicons name="download-outline" size={24} color={Colors.caramel} />
                <View style={styles.exportInfo}>
                  <Text style={styles.exportTitle}>Export Transactions</Text>
                  <Text style={styles.exportSubtext}>
                    Download CSV for your accounting software
                  </Text>
                </View>
              </View>
              <Button
                title="Download CSV"
                onPress={handleExportCSV}
                variant="outline"
                size="sm"
                icon="document-outline"
              />
            </Card>
          </>
        ) : (
          <>
            {/* Payout Overview Card */}
            <Card padding="lg" style={styles.payoutOverview}>
              <View style={styles.payoutOverviewRow}>
                <View style={styles.payoutOverviewItem}>
                  <Text style={styles.payoutOverviewLabel}>Total Paid</Text>
                  <Text style={[styles.payoutOverviewValue, { color: Colors.success }]}>
                    {formatCentsToDollars(totalPaidOut)}
                  </Text>
                </View>
                <View style={styles.payoutOverviewDivider} />
                <View style={styles.payoutOverviewItem}>
                  <Text style={styles.payoutOverviewLabel}>Platform Fees</Text>
                  <Text style={styles.payoutOverviewValue}>
                    {formatCentsToDollars(totalPlatformFees)}
                  </Text>
                </View>
                <View style={styles.payoutOverviewDivider} />
                <View style={styles.payoutOverviewItem}>
                  <Text style={styles.payoutOverviewLabel}>Pending</Text>
                  <Text style={[styles.payoutOverviewValue, { color: Colors.caramel }]}>
                    {formatCentsToDollars(stats.pendingPayoutCents)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Payout Schedule */}
            <Card padding="md" style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <Ionicons name="calendar-outline" size={20} color={Colors.caramel} />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleTitle}>Payout Schedule</Text>
                  <Text style={styles.scheduleText}>
                    Weekly on Mondays • Minimum {formatCentsToDollars(PLATFORM.MIN_PAYOUT_CENTS)} threshold
                  </Text>
                </View>
              </View>
            </Card>

            {/* Payout History */}
            <Text style={styles.sectionTitle}>Payout History</Text>

            {payouts.length === 0 ? (
              <Card padding="lg">
                <View style={styles.emptyHistory}>
                  <Ionicons name="wallet-outline" size={40} color={Colors.gray300} />
                  <Text style={styles.emptyText}>No payouts yet</Text>
                  <Text style={styles.emptySubtext}>
                    Payouts are processed every Monday.
                  </Text>
                </View>
              </Card>
            ) : (
              payouts.map((payout) => {
                const statusInfo = getPayoutStatusBadge(payout.status);
                return (
                  <Card key={payout.id} padding="md" style={styles.payoutCard}>
                    <View style={styles.payoutHeader}>
                      <View>
                        <Text style={styles.payoutPeriod}>
                          {formatDate(payout.periodStart)} – {formatDate(payout.periodEnd)}
                        </Text>
                        <Text style={styles.payoutAmount}>
                          {formatCentsToDollars(payout.payoutAmountCents)}
                        </Text>
                      </View>
                      <Badge label={statusInfo.label} variant={statusInfo.variant} />
                    </View>
                    <View style={styles.payoutDetails}>
                      <View style={styles.payoutDetail}>
                        <Text style={styles.payoutDetailLabel}>Orders</Text>
                        <Text style={styles.payoutDetailValue}>{payout.orderCount}</Text>
                      </View>
                      <View style={styles.payoutDetail}>
                        <Text style={styles.payoutDetailLabel}>Credits</Text>
                        <Text style={styles.payoutDetailValue}>{payout.totalCreditsRedeemed}</Text>
                      </View>
                      <View style={styles.payoutDetail}>
                        <Text style={styles.payoutDetailLabel}>Fee</Text>
                        <Text style={styles.payoutDetailValue}>
                          {formatCentsToDollars(payout.platformFeeCents)}
                        </Text>
                      </View>
                    </View>
                    {payout.completedAt && (
                      <Text style={styles.payoutDate}>
                        Paid on {formatDate(payout.completedAt)}
                      </Text>
                    )}
                  </Card>
                );
              })
            )}
          </>
        )}
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
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    paddingTop: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  tabActive: {
    backgroundColor: Colors.caramel + '12',
    borderColor: Colors.caramel,
  },
  tabText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  tabTextActive: {
    color: Colors.caramel,
  },

  // Summary
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
  },
  summaryLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },

  // Fee info
  feeCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.infoLight,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  feeInfo: {
    flex: 1,
  },
  feeText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray700,
    lineHeight: 20,
  },

  // Section
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },

  // Weekly cards
  weekCard: {
    marginBottom: Spacing.sm,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  weekLabel: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  weekRevenue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.md,
    color: Colors.success,
  },
  weekDetails: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  weekDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  weekDetailText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },

  // Export
  exportCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exportInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  exportTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  exportSubtext: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: 2,
  },

  // Payout Overview
  payoutOverview: {
    marginBottom: Spacing.md,
  },
  payoutOverviewRow: {
    flexDirection: 'row',
  },
  payoutOverviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  payoutOverviewDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },
  payoutOverviewLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  payoutOverviewValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
  },

  // Schedule
  scheduleCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.caramelMuted + '15',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    marginBottom: 2,
  },
  scheduleText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },

  // Payout cards
  payoutCard: {
    marginBottom: Spacing.sm,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  payoutPeriod: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginBottom: Spacing.xxs,
  },
  payoutAmount: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
  },
  payoutDetails: {
    flexDirection: 'row',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.sm,
  },
  payoutDetail: {
    alignItems: 'center',
  },
  payoutDetailLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginBottom: 2,
  },
  payoutDetailValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  payoutDate: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: Spacing.sm,
  },

  // Empty
  emptyHistory: {
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
});

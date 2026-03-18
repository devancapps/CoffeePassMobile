/**
 * Wallet Screen (C13)
 *
 * Displays credit balance, buy credits CTA, and recent transaction
 * activity. PRD Section 6.1: Has credits / Zero balance states.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CREDIT_BUNDLES, LedgerEntryType } from '@/config/constants';
import { formatCurrency, formatCredits, formatDate } from '@/utils/formatting';
import { MOCK_LEDGER_ENTRIES } from '@/data/mockTransactions';
import type { ConsumerStackParamList } from '@/navigation/types';
import type { CreditLedgerEntry } from '@/models';

type NavProp = NativeStackNavigationProp<ConsumerStackParamList>;

// ─── Component ───────────────────────────────────────────

export const WalletScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const balance = user?.creditBalance ?? 0;
  const hasCredits = balance > 0;

  // Show recent 5 ledger entries
  const recentEntries = MOCK_LEDGER_ENTRIES.slice(0, 5);

  const handleBuyCredits = useCallback(() => {
    navigation.navigate('BuyCredits');
  }, [navigation]);

  const handleViewHistory = useCallback(() => {
    navigation.navigate('CreditHistory');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Wallet</Text>

        {/* Balance Card */}
        <View style={[styles.balanceCard, Shadows.lg as object]}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <TouchableOpacity onPress={handleViewHistory}>
              <Ionicons name="time-outline" size={22} color={Colors.caramelMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceRow}>
            <Ionicons name="wallet" size={28} color={Colors.caramel} />
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceUnit}>credits</Text>
          </View>
          {hasCredits ? (
            <Text style={styles.balanceHint}>
              Use credits to redeem drinks at any partner cafe
            </Text>
          ) : (
            <Text style={styles.balanceHint}>
              Buy credits to start redeeming at partner cafes
            </Text>
          )}
          <View style={styles.balanceAction}>
            <Button
              title={hasCredits ? 'Buy More Credits' : 'Get Started'}
              onPress={handleBuyCredits}
              variant="primary"
              size="md"
              icon="add-circle-outline"
              fullWidth
            />
          </View>
        </View>

        {/* Quick Buy Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Credit Bundles</Text>
          <Badge label="Save up to 25%" variant="success" />
        </View>

        {CREDIT_BUNDLES.map((bundle, index) => (
          <Card
            key={bundle.id}
            padding="md"
            style={styles.bundleCard}
            onPress={handleBuyCredits}
          >
            <View style={styles.bundleRow}>
              <View style={styles.bundleLeft}>
                <View style={styles.bundleNameRow}>
                  <Text style={styles.bundleName}>{bundle.name}</Text>
                  {index === 2 && <Badge label="Most Popular" variant="warning" />}
                </View>
                <Text style={styles.bundleCredits}>
                  {bundle.credits} credits
                </Text>
                {bundle.discountPercent > 0 && (
                  <Text style={styles.bundlePerCredit}>
                    {formatCurrency(bundle.pricePerCredit * 100)}/credit
                  </Text>
                )}
              </View>
              <View style={styles.bundleRight}>
                <Text style={styles.bundlePrice}>
                  {formatCurrency(bundle.priceCents)}
                </Text>
                {bundle.discountPercent > 0 && (
                  <Badge
                    label={`Save ${bundle.discountPercent}%`}
                    variant="success"
                  />
                )}
              </View>
            </View>
          </Card>
        ))}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentEntries.length > 0 && (
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentEntries.length > 0 ? (
          recentEntries.map((entry) => (
            <LedgerEntryRow key={entry.id} entry={entry} />
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <Ionicons name="time-outline" size={32} color={Colors.gray300} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Your credit activity will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Ledger Entry Row ────────────────────────────────────

const LedgerEntryRow: React.FC<{ entry: CreditLedgerEntry }> = ({ entry }) => {
  const isPositive = entry.amount > 0;
  const icon = isPositive ? 'add-circle' : 'remove-circle';
  const iconColor = isPositive ? Colors.success : Colors.caramel;
  const amountColor = isPositive ? Colors.success : Colors.espresso;

  return (
    <View style={styles.entryRow}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <View style={styles.entryInfo}>
        <Text style={styles.entryDescription} numberOfLines={1}>
          {entry.description}
        </Text>
        <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
      </View>
      <View style={styles.entryAmount}>
        <Text style={[styles.entryAmountText, { color: amountColor }]}>
          {isPositive ? '+' : ''}{entry.amount}
        </Text>
        <Text style={styles.entryBalance}>
          bal: {entry.balanceAfter}
        </Text>
      </View>
    </View>
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
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    backgroundColor: Colors.espresso,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramelMuted,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  balanceAmount: {
    fontFamily: Typography.family.bold,
    fontSize: 48,
    color: Colors.white,
  },
  balanceUnit: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.lg,
    color: Colors.caramelMuted,
  },
  balanceHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.caramelMuted,
    marginTop: Spacing.md,
  },
  balanceAction: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
  },
  viewAllText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
  bundleCard: {
    marginBottom: Spacing.sm,
  },
  bundleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundleLeft: {},
  bundleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  bundleName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  bundleCredits: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  bundlePerCredit: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: 2,
  },
  bundleRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  bundlePrice: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.caramel,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: Spacing.md,
  },
  entryInfo: {
    flex: 1,
  },
  entryDescription: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  entryDate: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  entryAmount: {
    alignItems: 'flex-end',
  },
  entryAmountText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.md,
  },
  entryBalance: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: 1,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.gray300,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray300,
    marginTop: Spacing.xs,
  },
});

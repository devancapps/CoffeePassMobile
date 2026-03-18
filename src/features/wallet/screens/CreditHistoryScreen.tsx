/**
 * Credit History Screen (C15)
 *
 * Full ledger of credit activity: purchases, redemptions,
 * refunds, and expirations.
 * PRD Section 6.1: Scrollable ledger entries.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { LedgerEntryType } from '@/config/constants';
import { formatCredits, formatDate } from '@/utils/formatting';
import { MOCK_LEDGER_ENTRIES } from '@/data/mockTransactions';
import type { CreditLedgerEntry } from '@/models';
import type { ConsumerStackScreenProps } from '@/navigation/types';

// ─── Helpers ─────────────────────────────────────────────

function getLedgerIcon(type: LedgerEntryType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case LedgerEntryType.PURCHASE:
      return 'add-circle';
    case LedgerEntryType.REDEMPTION:
      return 'cafe';
    case LedgerEntryType.REFUND_EXPIRY:
    case LedgerEntryType.REFUND_CANCELLATION:
    case LedgerEntryType.PURCHASE_REFUND:
      return 'refresh-circle';
    case LedgerEntryType.CREDIT_EXPIRY:
      return 'time';
    case LedgerEntryType.CHARGEBACK:
    case LedgerEntryType.DISPUTE_CREDIT:
      return 'alert-circle';
    default:
      return 'ellipse';
  }
}

function getLedgerColor(amount: number): string {
  return amount > 0 ? Colors.success : Colors.espresso;
}

function getDateKey(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This Week';
  if (days < 30) return 'This Month';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Component ───────────────────────────────────────────

export const CreditHistoryScreen: React.FC<
  ConsumerStackScreenProps<'CreditHistory'>
> = ({ navigation }) => {
  const { user } = useAuth();

  // Group entries by date section
  const sections = useMemo(() => {
    const grouped: Record<string, CreditLedgerEntry[]> = {};

    MOCK_LEDGER_ENTRIES.forEach((entry) => {
      const key = getDateKey(entry.createdAt);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    });

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
          icon="arrow-back"
        />
        <Text style={styles.title}>Credit History</Text>
        <View style={styles.balancePill}>
          <Ionicons name="wallet" size={14} color={Colors.caramel} />
          <Text style={styles.balanceText}>
            {formatCredits(user?.creditBalance ?? 0)}
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            +{MOCK_LEDGER_ENTRIES.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0)}
          </Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.caramel }]}>
            {MOCK_LEDGER_ENTRIES.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0)}
          </Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {MOCK_LEDGER_ENTRIES.length}
          </Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
      </View>

      {/* Entries List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.entryRow}>
            <Ionicons
              name={getLedgerIcon(item.type)}
              size={24}
              color={getLedgerColor(item.amount)}
            />
            <View style={styles.entryInfo}>
              <Text style={styles.entryDescription}>{item.description}</Text>
              <Text style={styles.entryDate}>
                {item.createdAt.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {' · '}
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={styles.entryAmountCol}>
              <Text
                style={[
                  styles.entryAmount,
                  { color: getLedgerColor(item.amount) },
                ]}
              >
                {item.amount > 0 ? '+' : ''}{item.amount}
              </Text>
              <Text style={styles.entryBalanceAfter}>
                bal: {item.balanceAfter}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Credit History"
            subtitle="Your credit purchases and redemptions will appear here"
          />
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
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.caramel + '15',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  balanceText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.success,
  },
  statLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cream,
  },
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  entryAmountCol: {
    alignItems: 'flex-end',
  },
  entryAmount: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.md,
  },
  entryBalanceAfter: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: 1,
  },
});

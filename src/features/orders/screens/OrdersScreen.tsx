/**
 * Orders Screen (Consumer Tab)
 *
 * Displays order history with status badges and navigation
 * to order details. Supports filtering by status.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { formatCredits, formatDate } from '@/utils/formatting';
import { OrderStatus } from '@/config/constants';
import { MOCK_ORDERS, CAFE_NAME_MAP } from '@/data/mockTransactions';
import type { Order } from '@/models';
import type { ConsumerStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<ConsumerStackParamList>;

type StatusFilter = 'all' | OrderStatus;

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: OrderStatus.CREATED },
  { label: 'Ready', value: OrderStatus.READY_FOR_REDEMPTION },
  { label: 'Redeemed', value: OrderStatus.REDEEMED },
  { label: 'Expired', value: OrderStatus.EXPIRED },
];

function getStatusBadge(status: OrderStatus): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info';
} {
  switch (status) {
    case OrderStatus.CREATED:
      return { label: 'Created', variant: 'info' };
    case OrderStatus.READY_FOR_REDEMPTION:
      return { label: 'Ready', variant: 'warning' };
    case OrderStatus.REDEEMED:
      return { label: 'Redeemed', variant: 'success' };
    case OrderStatus.EXPIRED:
      return { label: 'Expired', variant: 'error' };
    case OrderStatus.CANCELLED:
      return { label: 'Cancelled', variant: 'error' };
    default:
      return { label: status, variant: 'info' };
  }
}

// ─── Component ───────────────────────────────────────────

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return MOCK_ORDERS;
    return MOCK_ORDERS.filter((o) => o.status === statusFilter);
  }, [statusFilter]);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetail', { orderId });
    },
    [navigation]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => {
      const cafeName = CAFE_NAME_MAP[item.cafeId] ?? 'Unknown Cafe';
      const status = getStatusBadge(item.status);

      return (
        <Card
          padding="md"
          style={styles.orderCard}
          onPress={() => handleOrderPress(item.id)}
        >
          <View style={styles.orderRow}>
            <View style={styles.orderIcon}>
              <Ionicons
                name={item.status === OrderStatus.REDEEMED ? 'checkmark-circle' : 'cafe'}
                size={24}
                color={
                  item.status === OrderStatus.REDEEMED
                    ? Colors.success
                    : Colors.caramel
                }
              />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.menuItemName}
              </Text>
              <Text style={styles.orderCafe}>{cafeName}</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.orderRight}>
              <Badge label={status.label} variant={status.variant} />
              <Text style={styles.orderCredits}>
                {item.creditAmount} cr
              </Text>
            </View>
          </View>
        </Card>
      );
    },
    [handleOrderPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>
          Track your redemptions and order history
        </Text>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.filterChip,
              statusFilter === opt.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(opt.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === opt.value && styles.filterChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summaryCredits}>
          {filteredOrders.reduce((s, o) => s + o.creditAmount, 0)} credits total
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={[
          styles.listContent,
          filteredOrders.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.caramel}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Orders Yet"
            subtitle={
              statusFilter === 'all'
                ? 'When you redeem a drink at a partner cafe, your orders will appear here.'
                : `No ${FILTER_OPTIONS.find((f) => f.value === statusFilter)?.label.toLowerCase()} orders found.`
            }
            actionLabel="Discover Cafes"
            onAction={() =>
              navigation.navigate('ConsumerTabs', { screen: 'Discover' })
            }
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
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
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  filterChipTextActive: {
    color: Colors.caramel,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  summaryText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  summaryCredits: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  orderCard: {
    marginBottom: Spacing.sm,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderItemName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  orderCafe: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: 1,
  },
  orderDate: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  orderCredits: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
});

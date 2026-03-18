/**
 * Order Detail Screen
 *
 * Shows full order information, status timeline,
 * and redemption code/QR when applicable.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatCredits, formatDate } from '@/utils/formatting';
import { OrderStatus } from '@/config/constants';
import { MOCK_ORDERS, CAFE_NAME_MAP } from '@/data/mockTransactions';
import type { ConsumerStackScreenProps } from '@/navigation/types';

// ─── Helpers ─────────────────────────────────────────────

function getStatusBadge(status: OrderStatus): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } {
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

function getStatusIcon(status: OrderStatus): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case OrderStatus.CREATED:
      return 'receipt-outline';
    case OrderStatus.READY_FOR_REDEMPTION:
      return 'qr-code-outline';
    case OrderStatus.REDEEMED:
      return 'checkmark-circle';
    case OrderStatus.EXPIRED:
      return 'time-outline';
    case OrderStatus.CANCELLED:
      return 'close-circle';
    default:
      return 'ellipse-outline';
  }
}

// ─── Component ───────────────────────────────────────────

export const OrderDetailScreen: React.FC<
  ConsumerStackScreenProps<'OrderDetail'>
> = ({ route, navigation }) => {
  const { orderId } = route.params;

  const order = useMemo(
    () => MOCK_ORDERS.find((o) => o.id === orderId),
    [orderId]
  );

  const cafeName = order ? CAFE_NAME_MAP[order.cafeId] ?? 'Unknown Cafe' : '';

  const handleRedeem = useCallback(() => {
    if (!order) return;
    const backupCode = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    navigation.navigate('RedemptionActive', {
      orderId: order.id,
      menuItemName: order.menuItemName,
      cafeName,
      creditAmount: order.creditAmount,
      backupCode,
      expiresAt: expiresAt.toISOString(),
    });
  }, [order, cafeName, navigation]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? Your credits will be refunded.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Order Cancelled', 'Credits have been refunded to your wallet.');
            navigation.goBack();
          },
        },
      ]
    );
  }, [navigation]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.gray300} />
          <Text style={styles.errorText}>Order not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusBadge(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
          icon="arrow-back"
        />

        {/* Status Header */}
        <View style={styles.statusSection}>
          <Ionicons
            name={getStatusIcon(order.status)}
            size={56}
            color={
              order.status === OrderStatus.REDEEMED
                ? Colors.success
                : order.status === OrderStatus.CREATED
                  ? Colors.caramel
                  : Colors.gray500
            }
          />
          <Badge label={statusInfo.label} variant={statusInfo.variant} />
          <Text style={styles.itemName}>{order.menuItemName}</Text>
          <Text style={styles.cafeName}>{cafeName}</Text>
        </View>

        {/* Details Card */}
        <Card padding="lg" style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>{order.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Credits</Text>
            <Text style={styles.detailValue}>
              {formatCredits(order.creditAmount)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {formatDate(order.createdAt)}
            </Text>
          </View>
          {order.redeemedAt && (
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Redeemed</Text>
              <Text style={styles.detailValue}>
                {formatDate(order.redeemedAt)}
              </Text>
            </View>
          )}
        </Card>

        {/* QR Code Placeholder (for READY_FOR_REDEMPTION status) */}
        {order.status === OrderStatus.READY_FOR_REDEMPTION && (
          <Card padding="lg" style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={100} color={Colors.espresso} />
            </View>
            <Text style={styles.qrHint}>
              Show this to the barista
            </Text>
            <View style={styles.backupCode}>
              <Text style={styles.backupCodeLabel}>Backup Code</Text>
              <Text style={styles.backupCodeValue}>4821</Text>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {order.status === OrderStatus.CREATED && (
            <>
              <Button
                title="Generate QR Code"
                onPress={handleRedeem}
                variant="primary"
                size="lg"
                fullWidth
                icon="qr-code-outline"
              />
              <View style={{ height: Spacing.sm }} />
              <Button
                title="Cancel Order"
                onPress={handleCancel}
                variant="ghost"
                size="md"
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
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
  statusSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  itemName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginTop: Spacing.sm,
  },
  cafeName: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
  },
  detailCard: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  detailLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  detailValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  qrCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  qrPlaceholder: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  qrHint: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  backupCode: {
    alignItems: 'center',
    backgroundColor: Colors.creamDark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  backupCodeLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  backupCodeValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    letterSpacing: 8,
  },
  actions: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
});

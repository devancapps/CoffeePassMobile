/**
 * Redemption Active Screen (C10)
 *
 * Shows QR code, 4-digit backup code, and live countdown timer.
 * Consumer shows this screen to the barista for redemption.
 * PRD Section 8.3: 15-minute TTL token display.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useCountdown } from '@/hooks/useCountdown';
import { useAuth } from '@/hooks/useAuth';
import { REDEMPTION } from '@/config/constants';
import type { ConsumerStackScreenProps } from '@/navigation/types';

// ─── Component ───────────────────────────────────────────

export const RedemptionActiveScreen: React.FC<
  ConsumerStackScreenProps<'RedemptionActive'>
> = ({ route, navigation }) => {
  const { orderId, menuItemName, cafeName, creditAmount, backupCode, expiresAt } =
    route.params;
  const { updateCreditBalance } = useAuth();

  const expiresAtDate = new Date(expiresAt);
  const { formatted, isExpired, remainingSeconds, progress } = useCountdown(
    expiresAtDate,
    REDEMPTION.TOKEN_TTL_MINUTES * 60
  );

  const [cancelled, setCancelled] = useState(false);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Redemption',
      `Cancel this order and refund ${creditAmount} credits to your wallet?`,
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel & Refund',
          style: 'destructive',
          onPress: async () => {
            // Refund credits in mock mode
            await updateCreditBalance(creditAmount);
            setCancelled(true);
            Vibration.vibrate(100);
            Alert.alert(
              'Order Cancelled',
              `${creditAmount} credits have been refunded to your wallet.`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          },
        },
      ]
    );
  }, [creditAmount, updateCreditBalance, navigation]);

  // ─── Expired State ─────────────────────────────────────

  if (isExpired && !cancelled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Ionicons name="time" size={80} color={Colors.error} />
          <Text style={styles.expiredTitle}>Token Expired</Text>
          <Text style={styles.expiredSubtitle}>
            Your redemption code has expired. Credits have been automatically
            refunded to your wallet.
          </Text>
          <View style={styles.expiredActions}>
            <Button
              title="Back to Orders"
              onPress={() => navigation.goBack()}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Active State ──────────────────────────────────────

  const isUrgent = remainingSeconds <= 120; // Last 2 minutes

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Badge label="Active" variant="success" />
          <Text style={styles.headerTitle}>Show to Barista</Text>
          <Text style={styles.headerSubtitle}>
            {menuItemName} at {cafeName}
          </Text>
        </View>

        {/* QR Code Display */}
        <Card padding="lg" style={styles.qrCard}>
          <View style={styles.qrContainer}>
            <View style={styles.qrFrame}>
              <Ionicons name="qr-code" size={160} color={Colors.espresso} />
            </View>
          </View>

          {/* Backup Code */}
          <View style={styles.backupSection}>
            <Text style={styles.backupLabel}>Backup Code</Text>
            <View style={styles.codeContainer}>
              {backupCode.split('').map((digit, i) => (
                <View key={i} style={styles.codeDigit}>
                  <Text style={styles.codeDigitText}>{digit}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.backupHint}>
              Tell the barista this code if scanning doesn't work
            </Text>
          </View>
        </Card>

        {/* Countdown Timer */}
        <View
          style={[
            styles.timerCard,
            isUrgent && styles.timerCardUrgent,
          ]}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={isUrgent ? Colors.error : Colors.caramel}
          />
          <View style={styles.timerInfo}>
            <Text
              style={[
                styles.timerText,
                isUrgent && styles.timerTextUrgent,
              ]}
            >
              {formatted}
            </Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: isUrgent ? Colors.error : Colors.caramel,
                },
              ]}
            />
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.orderInfoRow}>
            <Ionicons name="cafe-outline" size={16} color={Colors.gray500} />
            <Text style={styles.orderInfoText}>{cafeName}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.gray500} />
            <Text style={styles.orderInfoText}>{creditAmount} credits</Text>
          </View>
        </View>

        {/* Cancel Button */}
        <View style={styles.actions}>
          <Button
            title="Cancel Order"
            onPress={handleCancel}
            variant="ghost"
            size="md"
            icon="close-circle-outline"
          />
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  expiredTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  expiredSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  expiredActions: {
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  headerTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginTop: Spacing.sm,
  },
  headerSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
  },
  qrCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    marginBottom: Spacing.lg,
  },
  qrFrame: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: Colors.espresso,
  },
  backupSection: {
    alignItems: 'center',
    width: '100%',
  },
  backupLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  codeDigit: {
    width: 52,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  codeDigitText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
  },
  backupHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    textAlign: 'center',
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.caramel + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  timerCardUrgent: {
    backgroundColor: Colors.errorLight,
  },
  timerInfo: {
    flex: 1,
  },
  timerText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.caramel,
  },
  timerTextUrgent: {
    color: Colors.error,
  },
  timerLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
  progressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray200,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  orderInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  orderInfoText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray700,
  },
  actions: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
});

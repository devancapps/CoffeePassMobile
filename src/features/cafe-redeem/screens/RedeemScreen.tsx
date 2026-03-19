/**
 * Cafe Redeem Screen (F09)
 *
 * Barista scans QR code or enters 4-digit backup code
 * to redeem a customer's order. Shows success/failure states.
 * PRD Section 6.2: Scanner + manual entry + result states.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { haptics } from '@/utils/haptics';

type RedeemState = 'idle' | 'verifying' | 'success' | 'error';

interface RedeemResult {
  menuItemName: string;
  customerName: string;
  credits: number;
}

// ─── Component ───────────────────────────────────────────

export const RedeemScreen: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [redeemState, setRedeemState] = useState<RedeemState>('idle');
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenScanner = useCallback(() => {
    Alert.alert(
      'QR Scanner',
      'Camera-based QR scanning requires expo-camera which needs a dev build. For now, use the manual code entry below.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleVerifyCode = useCallback(async () => {
    if (manualCode.length !== 4) return;

    setRedeemState('verifying');

    try {
      // Mock verification: simulate 1s API call
      await new Promise((r) => setTimeout(r, 1000));

      // Mock: codes starting with "0" are invalid for testing
      if (manualCode.startsWith('0')) {
        throw new Error('Invalid or expired code');
      }

      // Mock success
      haptics.success();
      setResult({
        menuItemName: 'Classic Latte',
        customerName: 'Alex',
        credits: 5,
      });
      setRedeemState('success');
    } catch (err) {
      haptics.error();
      setErrorMessage(
        err instanceof Error ? err.message : 'Verification failed'
      );
      setRedeemState('error');
    }
  }, [manualCode]);

  const handleReset = useCallback(() => {
    setManualCode('');
    setRedeemState('idle');
    setResult(null);
    setErrorMessage('');
  }, []);

  // ─── Success State ─────────────────────────────────────

  if (redeemState === 'success' && result) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.resultContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={64} color={Colors.white} />
          </View>
          <Text style={styles.resultTitle}>Redeemed!</Text>

          <Card padding="lg" style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Item</Text>
              <Text style={styles.resultValue}>{result.menuItemName}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Customer</Text>
              <Text style={styles.resultValue}>{result.customerName}</Text>
            </View>
            <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.resultLabel}>Credits</Text>
              <Text style={styles.resultValue}>{result.credits} credits</Text>
            </View>
          </Card>

          <Text style={styles.resultHint}>
            Please prepare the customer's order
          </Text>

          <Button
            title="Redeem Another"
            onPress={handleReset}
            variant="primary"
            size="lg"
            fullWidth
            icon="qr-code-outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error State ───────────────────────────────────────

  if (redeemState === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.resultContainer}>
          <View style={styles.errorCircle}>
            <Ionicons name="close" size={64} color={Colors.white} />
          </View>
          <Text style={styles.resultTitle}>Redemption Failed</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>

          <View style={styles.errorReasons}>
            <Text style={styles.errorReasonsTitle}>Possible reasons:</Text>
            {[
              'Code has already been used',
              'Code has expired (15-min window)',
              'Code is for a different cafe',
              'Invalid code entered',
            ].map((reason) => (
              <View key={reason} style={styles.errorReasonRow}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.gray500} />
                <Text style={styles.errorReasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          <Button
            title="Try Again"
            onPress={handleReset}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Idle / Verifying State ────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Redeem Order</Text>
        <Text style={styles.subtitle}>
          Scan a customer's QR code or enter their 4-digit backup code
        </Text>
      </View>

      <View style={styles.content}>
        {/* QR Scanner Placeholder */}
        <View style={styles.scannerPlaceholder}>
          <View style={styles.scannerFrame}>
            <View style={styles.scannerCorners}>
              <Ionicons name="scan-outline" size={100} color={Colors.caramelMuted} />
            </View>
            <Text style={styles.scannerText}>QR Scanner</Text>
            <Text style={styles.scannerSubtext}>
              Point camera at the customer's QR code
            </Text>
          </View>
        </View>

        <Button
          title="Open Camera Scanner"
          onPress={handleOpenScanner}
          variant="primary"
          icon="camera-outline"
          size="lg"
          fullWidth
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Code Entry */}
        <Card padding="lg" style={styles.manualCard}>
          <Text style={styles.manualTitle}>Enter Backup Code</Text>
          <Text style={styles.manualSubtitle}>
            Ask the customer for their 4-digit backup code
          </Text>

          {/* Large digit display */}
          <View style={styles.digitRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.digitBox,
                  manualCode[i] ? styles.digitBoxFilled : undefined,
                ]}
              >
                <Text style={styles.digitText}>
                  {manualCode[i] ?? ''}
                </Text>
              </View>
            ))}
          </View>

          <Input
            placeholder="Enter 4-digit code"
            value={manualCode}
            onChangeText={(text) =>
              setManualCode(text.replace(/[^0-9]/g, '').slice(0, 4))
            }
            keyboardType="number-pad"
            maxLength={4}
            leftIcon="keypad-outline"
          />

          <Button
            title={redeemState === 'verifying' ? 'Verifying...' : 'Verify & Redeem'}
            onPress={handleVerifyCode}
            variant="secondary"
            size="lg"
            fullWidth
            disabled={manualCode.length !== 4}
            loading={redeemState === 'verifying'}
            icon="checkmark-circle-outline"
          />
        </Card>

        {/* Recent Redemptions Count */}
        <View style={styles.statsRow}>
          <Ionicons name="today-outline" size={18} color={Colors.gray500} />
          <Text style={styles.statsText}>0 redemptions today</Text>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scannerPlaceholder: {
    backgroundColor: Colors.espresso,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md as object,
  },
  scannerFrame: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  scannerCorners: {
    marginBottom: Spacing.md,
  },
  scannerText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.white,
  },
  scannerSubtext: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.caramelMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  dividerText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray300,
    marginHorizontal: Spacing.md,
  },
  manualCard: {
    marginBottom: Spacing.lg,
  },
  manualTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.xs,
  },
  manualSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginBottom: Spacing.lg,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  digitBox: {
    width: 56,
    height: 68,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxFilled: {
    borderColor: Colors.caramel,
    backgroundColor: Colors.caramel + '08',
  },
  digitText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  statsText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  // Result states
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  errorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resultTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginBottom: Spacing.lg,
  },
  resultCard: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  resultLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
  },
  resultValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  resultHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  errorText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorReasons: {
    width: '100%',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  errorReasonsTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    marginBottom: Spacing.md,
  },
  errorReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorReasonText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray700,
    flex: 1,
  },
});

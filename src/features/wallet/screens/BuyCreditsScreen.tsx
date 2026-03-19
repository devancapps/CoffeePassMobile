/**
 * Buy Credits Screen (C14)
 *
 * Select a credit bundle and confirm purchase.
 * PRD Section 8.2: Bundle selection → payment → success.
 *
 * In mock mode: simulates purchase with delay.
 * In production: Stripe Payment Intent via Cloud Function.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { CREDIT_BUNDLES, CreditBundle } from '@/config/constants';
import { formatCurrency, formatCredits } from '@/utils/formatting';
import { haptics } from '@/utils/haptics';
import { useToast } from '@/context/ToastContext';
import { useStripePayment } from '@/hooks/useStripePayment';
import { USE_STRIPE_PAYMENTS } from '@/config/stripe';
import type { ConsumerStackScreenProps } from '@/navigation/types';

type PurchaseState = 'selecting' | 'confirming' | 'processing' | 'success' | 'error';

// ─── Component ───────────────────────────────────────────

export const BuyCreditsScreen: React.FC<ConsumerStackScreenProps<'BuyCredits'>> = ({
  navigation,
}) => {
  const { user, updateCreditBalance } = useAuth();
  const { showToast } = useToast();
  const { isProcessing, initiatePayment } = useStripePayment();
  const [selectedBundle, setSelectedBundle] = useState<CreditBundle | null>(null);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('selecting');
  const [purchasedCredits, setPurchasedCredits] = useState(0);

  // Guard against rapid double-taps firing multiple payment requests
  // before React re-renders the processing spinner.
  const isSubmittingRef = useRef(false);

  const handleSelectBundle = useCallback((bundle: CreditBundle) => {
    haptics.light();
    setSelectedBundle(bundle);
    setPurchaseState('confirming');
  }, []);

  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedBundle || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setPurchaseState('processing');

    try {
      const result = await initiatePayment(selectedBundle);

      if (result.status === 'cancelled') {
        // User dismissed the Payment Sheet — go back to bundle selection
        isSubmittingRef.current = false;
        setPurchaseState('selecting');
        return;
      }

      if (result.status === 'error') {
        haptics.error();
        isSubmittingRef.current = false;
        setPurchaseState('error');
        return;
      }

      // Payment succeeded
      // In mock mode: immediately update in-memory balance (no webhook).
      // In Stripe mode: webhook (handleStripeWebhook CF) fulfills credits;
      //   we optimistically update the local balance for instant UX.
      if (!USE_STRIPE_PAYMENTS) {
        await updateCreditBalance(selectedBundle.credits);
      } else {
        // Optimistic update: add credits locally while webhook processes
        await updateCreditBalance(selectedBundle.credits);
      }

      setPurchasedCredits(selectedBundle.credits);
      haptics.success();
      showToast(`${selectedBundle.credits} credits added to your wallet!`, 'success');
      setPurchaseState('success');
      // Note: isSubmittingRef intentionally stays true on success —
      // the screen transitions to the success view and never returns here.
    } catch {
      haptics.error();
      isSubmittingRef.current = false;
      setPurchaseState('error');
    }
  }, [selectedBundle, updateCreditBalance, initiatePayment, showToast]);

  const handleDone = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ─── Processing State ──────────────────────────────────

  if (purchaseState === 'processing' || isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Processing payment..." />
      </SafeAreaView>
    );
  }

  // ─── Success State ─────────────────────────────────────

  if (purchaseState === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Credits Added!</Text>
          <Text style={styles.successAmount}>
            +{purchasedCredits} credits
          </Text>
          <Text style={styles.successBalance}>
            New balance: {formatCredits((user?.creditBalance ?? 0))}
          </Text>
          <Card padding="lg" style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Bundle</Text>
              <Text style={styles.successValue}>{selectedBundle?.name}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Amount Paid</Text>
              <Text style={styles.successValue}>
                {formatCurrency(selectedBundle?.priceCents ?? 0)}
              </Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Credits Issued</Text>
              <Text style={styles.successValue}>{purchasedCredits}</Text>
            </View>
            <View style={[styles.successRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.successLabel}>Expires</Text>
              <Text style={styles.successValue}>12 months</Text>
            </View>
          </Card>
          <View style={styles.successActions}>
            <Button
              title="Done"
              onPress={handleDone}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error State ───────────────────────────────────────

  if (purchaseState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="alert-circle" size={80} color={Colors.error} />
          <Text style={styles.successTitle}>Payment Failed</Text>
          <Text style={styles.successBalance}>
            Something went wrong. Please try again.
          </Text>
          <View style={styles.successActions}>
            <Button
              title="Try Again"
              onPress={() => setPurchaseState('selecting')}
              variant="primary"
              size="lg"
              fullWidth
            />
            <View style={{ height: Spacing.sm }} />
            <Button
              title="Go Back"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="md"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Confirming State ──────────────────────────────────

  if (purchaseState === 'confirming' && selectedBundle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Button
            title="Back"
            onPress={() => setPurchaseState('selecting')}
            variant="ghost"
            size="sm"
            icon="arrow-back"
          />

          <Text style={styles.pageTitle}>Confirm Purchase</Text>

          <Card padding="lg" style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <View style={styles.confirmIconWrap}>
                <Ionicons name="wallet" size={32} color={Colors.caramel} />
              </View>
              <Text style={styles.confirmBundleName}>
                {selectedBundle.name} Bundle
              </Text>
            </View>

            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Credits</Text>
                <Text style={styles.confirmValue}>
                  {selectedBundle.credits} credits
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Price</Text>
                <Text style={styles.confirmValue}>
                  {formatCurrency(selectedBundle.priceCents)}
                </Text>
              </View>
              {selectedBundle.discountPercent > 0 && (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Savings</Text>
                  <Text style={[styles.confirmValue, { color: Colors.success }]}>
                    {selectedBundle.discountPercent}% off
                  </Text>
                </View>
              )}
              <View style={[styles.confirmRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.confirmLabel}>Per Credit</Text>
                <Text style={styles.confirmValue}>
                  {formatCurrency(selectedBundle.pricePerCredit * 100)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Method */}
          <Card padding="md" style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={24} color={Colors.caramel} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Payment Method</Text>
                <Text style={styles.paymentSubtitle}>
                  {USE_STRIPE_PAYMENTS
                    ? 'Stripe Payment Sheet'
                    : 'Stripe (mock mode — no charge)'}
                </Text>
              </View>
              <Ionicons
                name={USE_STRIPE_PAYMENTS ? 'chevron-forward' : 'flask-outline'}
                size={18}
                color={Colors.gray300}
              />
            </View>
          </Card>

          <Text style={styles.legalText}>
            Credits expire 12 months after purchase. By purchasing, you agree to the
            CoffeePass Terms of Service.
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <Button
            title={`Pay ${formatCurrency(selectedBundle.priceCents)}`}
            onPress={handleConfirmPurchase}
            variant="primary"
            size="lg"
            fullWidth
            icon="lock-closed-outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Selecting State (Default) ─────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
          icon="arrow-back"
        />

        <Text style={styles.pageTitle}>Buy Credits</Text>
        <Text style={styles.pageSubtitle}>
          Choose a bundle to add credits to your wallet.
          Larger bundles save you more!
        </Text>

        {/* Current Balance */}
        <View style={styles.currentBalance}>
          <Ionicons name="wallet-outline" size={18} color={Colors.gray500} />
          <Text style={styles.currentBalanceText}>
            Current balance: {formatCredits(user?.creditBalance ?? 0)}
          </Text>
        </View>

        {/* Bundle Cards */}
        {CREDIT_BUNDLES.map((bundle, index) => {
          const isPopular = index === 2; // Value bundle
          const isBestValue = index === CREDIT_BUNDLES.length - 1;

          return (
            <Card
              key={bundle.id}
              padding="lg"
              style={isPopular
                ? { ...styles.selectCard, ...styles.selectCardPopular }
                : styles.selectCard
              }
              onPress={() => handleSelectBundle(bundle)}
            >
              <View style={styles.selectRow}>
                <View style={styles.selectLeft}>
                  <View style={styles.selectNameRow}>
                    <Text style={styles.selectName}>{bundle.name}</Text>
                    {isPopular && <Badge label="Most Popular" variant="warning" />}
                    {isBestValue && <Badge label="Best Value" variant="success" />}
                  </View>
                  <Text style={styles.selectCredits}>
                    {bundle.credits} credits
                  </Text>
                  <Text style={styles.selectPerCredit}>
                    {formatCurrency(bundle.pricePerCredit * 100)} per credit
                  </Text>
                </View>
                <View style={styles.selectRight}>
                  <Text style={styles.selectPrice}>
                    {formatCurrency(bundle.priceCents)}
                  </Text>
                  {bundle.discountPercent > 0 && (
                    <Badge
                      label={`-${bundle.discountPercent}%`}
                      variant="success"
                    />
                  )}
                </View>
              </View>
            </Card>
          );
        })}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.success} />
            <Text style={styles.infoText}>Secure payments via Stripe</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color={Colors.success} />
            <Text style={styles.infoText}>Credits valid for 12 months</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cafe-outline" size={20} color={Colors.success} />
            <Text style={styles.infoText}>Redeem at any partner cafe</Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  pageTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  currentBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.creamDark,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  currentBalanceText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray700,
  },
  selectCard: {
    marginBottom: Spacing.md,
  },
  selectCardPopular: {
    borderWidth: 2,
    borderColor: Colors.caramel,
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectLeft: {
    flex: 1,
  },
  selectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  selectName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  selectCredits: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  selectPerCredit: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: 2,
  },
  selectRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginLeft: Spacing.md,
  },
  selectPrice: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.caramel,
  },
  infoSection: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  // Confirm state
  confirmCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  confirmIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.caramel + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  confirmBundleName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
  },
  confirmDetails: {},
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  confirmLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
  },
  confirmValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  paymentCard: {
    marginBottom: Spacing.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  paymentSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  legalText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomActions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successIcon: {
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
  },
  successAmount: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  successBalance: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  successCard: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  successLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  successValue: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
  },
  successActions: {
    width: '100%',
  },
});

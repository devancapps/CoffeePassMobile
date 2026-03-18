import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { OnboardingProgress } from '../components/OnboardingProgress';
import type { CafeOnboardingScreenProps } from '@/navigation/types';

const STEP_LABELS = ['Business Profile', 'Menu Setup', 'Payout Setup', 'Review'];

/**
 * Cafe Onboarding Step 4 — Payout Setup (PRD F06)
 *
 * Connect Stripe to receive weekly payouts.
 * Can be skipped but a banner persists until completed.
 */
export const PayoutSetupScreen: React.FC<CafeOnboardingScreenProps<'PayoutSetup'>> = ({
  navigation,
}) => {
  const [isConnected, setIsConnected] = useState(false);

  function handleConnectStripe(): void {
    // TODO: Open Stripe Connect OAuth flow via Cloud Function
    Alert.alert(
      'Stripe Connect',
      'In production, this opens the Stripe Connect onboarding flow to connect your bank account.',
      [
        {
          text: 'Simulate Connected',
          onPress: () => setIsConnected(true),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  function handleSkip(): void {
    Alert.alert(
      'Skip Payout Setup?',
      'You can connect your bank later, but you won\'t receive payouts until you do.',
      [
        { text: 'Skip for Now', onPress: () => navigation.navigate('ReviewGoLive') },
        { text: 'Go Back', style: 'cancel' },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OnboardingProgress currentStep={3} totalSteps={4} stepLabels={STEP_LABELS} />

      <View style={styles.content}>
        <Text style={styles.title}>Get paid weekly</Text>
        <Text style={styles.subtitle}>
          Connect your bank account through Stripe to receive automatic weekly payouts every Monday
        </Text>

        {/* Payout Info Card */}
        <Card padding="lg" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Secure & Automatic</Text>
              <Text style={styles.infoDesc}>
                Stripe handles all payments securely. Your bank details are never stored by CoffeePass.
              </Text>
            </View>
          </View>
        </Card>

        {/* Rate Card */}
        <Card padding="lg" style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <Text style={styles.rateTitle}>Your Payout Rate</Text>
            <Badge label="Founder Rate" variant="success" />
          </View>
          <View style={styles.rateDetails}>
            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>88¢</Text>
              <Text style={styles.rateLabel}>per credit</Text>
            </View>
            <View style={styles.rateDivider} />
            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>12%</Text>
              <Text style={styles.rateLabel}>platform fee</Text>
            </View>
            <View style={styles.rateDivider} />
            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>Weekly</Text>
              <Text style={styles.rateLabel}>payouts</Text>
            </View>
          </View>
          <Text style={styles.rateNote}>
            Founder rate locked for your first 6 months (vs 20% standard)
          </Text>
        </Card>

        {/* Status */}
        {isConnected && (
          <View style={styles.connectedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.connectedText}>Bank account connected</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isConnected ? (
          <Button
            title="Continue to Review"
            onPress={() => navigation.navigate('ReviewGoLive')}
            variant="primary"
            size="lg"
            fullWidth
            icon="arrow-forward"
          />
        ) : (
          <>
            <Button
              title="Connect Bank Account"
              onPress={handleConnectStripe}
              variant="primary"
              size="lg"
              fullWidth
              icon="card-outline"
            />
            <View style={styles.spacer} />
            <Button
              title="Skip for Now"
              onPress={handleSkip}
              variant="ghost"
              size="md"
            />
          </>
        )}
        <View style={styles.backRow}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="sm"
            icon="arrow-back"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  infoCard: { marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', gap: Spacing.md },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: 4,
  },
  infoDesc: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    lineHeight: 20,
  },
  rateCard: { marginBottom: Spacing.lg },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rateTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  rateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  rateItem: { alignItems: 'center' },
  rateValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
  },
  rateLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  rateDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },
  rateNote: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.success,
    textAlign: 'center',
  },
  connectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  connectedText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.success,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  spacer: { height: Spacing.sm },
  backRow: { marginTop: Spacing.md },
});

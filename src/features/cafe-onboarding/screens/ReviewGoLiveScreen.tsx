import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { useAuth } from '@/hooks/useAuth';
import type { CafeOnboardingScreenProps } from '@/navigation/types';

const STEP_LABELS = ['Business Profile', 'Menu Setup', 'Payout Setup', 'Review'];

/**
 * Cafe Onboarding Step 5 — Review & Go Live (PRD F07)
 *
 * Summary of all info entered. Submit for admin review.
 */
export const ReviewGoLiveScreen: React.FC<CafeOnboardingScreenProps<'ReviewGoLive'>> = ({
  navigation,
}) => {
  const { completeOnboarding } = useAuth();

  function handleGoLive(): void {
    Alert.alert(
      'Submit for Review',
      'Your cafe will be reviewed by the CoffeePass team. This usually takes less than 24 hours.',
      [
        {
          text: 'Go Live!',
          onPress: () => {
            // TODO: Set cafe status to PENDING_REVIEW in Firestore
            completeOnboarding();
          },
        },
        { text: 'Not Yet', style: 'cancel' },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OnboardingProgress currentStep={4} totalSteps={4} stepLabels={STEP_LABELS} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>You're almost live! 🎉</Text>
        <Text style={styles.subtitle}>
          Review your setup before submitting for approval
        </Text>

        {/* Business Profile Summary */}
        <Card padding="md" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryRow}>
              <Ionicons name="storefront-outline" size={20} color={Colors.caramel} />
              <Text style={styles.summaryTitle}>Business Profile</Text>
            </View>
            <Badge label="Complete" variant="success" />
          </View>
          <Text style={styles.summaryDetail}>Cafe name, address, hours, and photo configured</Text>
          <Button
            title="Edit"
            onPress={() => navigation.navigate('BusinessProfile')}
            variant="ghost"
            size="sm"
          />
        </Card>

        {/* Menu Summary */}
        <Card padding="md" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryRow}>
              <Ionicons name="restaurant-outline" size={20} color={Colors.caramel} />
              <Text style={styles.summaryTitle}>Menu</Text>
            </View>
            <Badge label="Complete" variant="success" />
          </View>
          <Text style={styles.summaryDetail}>Menu items added and ready for customers</Text>
          <Button
            title="Edit"
            onPress={() => navigation.navigate('MenuSetup')}
            variant="ghost"
            size="sm"
          />
        </Card>

        {/* Payout Summary */}
        <Card padding="md" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryRow}>
              <Ionicons name="card-outline" size={20} color={Colors.caramel} />
              <Text style={styles.summaryTitle}>Payouts</Text>
            </View>
            <Badge label="Pending" variant="warning" />
          </View>
          <Text style={styles.summaryDetail}>
            Connect your bank account to receive weekly payouts
          </Text>
          <Button
            title="Connect Now"
            onPress={() => navigation.navigate('PayoutSetup')}
            variant="ghost"
            size="sm"
          />
        </Card>

        {/* What Happens Next */}
        <View style={styles.nextSection}>
          <Text style={styles.nextTitle}>What happens next?</Text>
          {[
            { icon: 'time-outline' as const, text: 'We review your cafe within 24 hours' },
            { icon: 'checkmark-circle-outline' as const, text: 'You get a notification when approved' },
            { icon: 'people-outline' as const, text: 'Customers can discover and visit your cafe' },
            { icon: 'wallet-outline' as const, text: 'Weekly payouts start after your first redemption' },
          ].map((item) => (
            <View key={item.text} style={styles.nextItem}>
              <Ionicons name={item.icon} size={20} color={Colors.success} />
              <Text style={styles.nextText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Go Live */}
        <View style={styles.buttonGroup}>
          <Button
            title="Submit & Go Live"
            onPress={handleGoLive}
            variant="primary"
            size="lg"
            fullWidth
            icon="rocket-outline"
          />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
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
    marginBottom: Spacing.lg,
  },
  summaryCard: { marginBottom: Spacing.md },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  summaryDetail: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginBottom: Spacing.sm,
  },
  nextSection: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  nextTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.success,
    marginBottom: Spacing.md,
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nextText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    flex: 1,
  },
  buttonGroup: { marginTop: Spacing.md },
  backRow: { alignItems: 'center', marginTop: Spacing.md },
});

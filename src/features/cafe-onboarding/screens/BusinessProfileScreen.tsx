import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { OnboardingProgress } from '../components/OnboardingProgress';
import type { CafeOnboardingScreenProps } from '@/navigation/types';

const STEP_LABELS = ['Business Profile', 'Menu Setup', 'Payout Setup', 'Review'];

/**
 * Cafe Onboarding Step 2 — Business Profile (PRD F04)
 *
 * Cafe name, address, phone, photo, description, hours.
 */
export const BusinessProfileScreen: React.FC<CafeOnboardingScreenProps<'BusinessProfile'>> = ({
  navigation,
}) => {
  const [cafeName, setCafeName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (cafeName.trim().length < 2) errs.cafeName = 'Cafe name is required';
    if (address.trim().length < 5) errs.address = 'Please enter a valid address';
    if (phone.trim().length < 7) errs.phone = 'Please enter a valid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext(): void {
    if (!validate()) return;
    // TODO: Save business profile to Firestore
    navigation.navigate('MenuSetup');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OnboardingProgress currentStep={1} totalSteps={4} stepLabels={STEP_LABELS} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Tell us about your cafe</Text>
          <Text style={styles.subtitle}>
            This info helps customers find and recognize your shop
          </Text>

          {/* Photo Upload Placeholder */}
          <TouchableOpacity style={styles.photoUpload} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={32} color={Colors.caramel} />
            <Text style={styles.photoText}>Add Cafe Photo</Text>
            <Text style={styles.photoHint}>Min 400×300px · JPEG or PNG</Text>
          </TouchableOpacity>

          {/* Form */}
          <Input
            label="Cafe Name"
            placeholder="e.g. The Daily Grind"
            value={cafeName}
            onChangeText={(t) => { setCafeName(t); setErrors((e) => ({ ...e, cafeName: '' })); }}
            error={errors.cafeName}
            leftIcon="cafe-outline"
          />

          <Input
            label="Address"
            placeholder="Start typing your address..."
            value={address}
            onChangeText={(t) => { setAddress(t); setErrors((e) => ({ ...e, address: '' })); }}
            error={errors.address}
            leftIcon="location-outline"
          />

          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            value={phone}
            onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: '' })); }}
            error={errors.phone}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />

          <Input
            label="Description (optional)"
            placeholder="Tell customers what makes your cafe special"
            value={description}
            onChangeText={setDescription}
            leftIcon="document-text-outline"
            multiline
            maxLength={280}
          />

          {/* Hours Placeholder */}
          <View style={styles.hoursSection}>
            <Text style={styles.hoursLabel}>Hours of Operation</Text>
            <TouchableOpacity style={styles.hoursCard} activeOpacity={0.7}>
              <Ionicons name="time-outline" size={24} color={Colors.caramel} />
              <View style={styles.hoursInfo}>
                <Text style={styles.hoursTitle}>Set Your Hours</Text>
                <Text style={styles.hoursHint}>
                  Tap to configure daily open/close times
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="Continue to Menu Setup"
              onPress={handleNext}
              variant="primary"
              size="lg"
              fullWidth
              icon="arrow-forward"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
    marginBottom: Spacing.lg,
  },
  photoUpload: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm as object,
  },
  photoText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.caramel,
    marginTop: Spacing.sm,
  },
  photoHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: Spacing.xxs,
  },
  hoursSection: {
    marginBottom: Spacing.lg,
  },
  hoursLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    marginBottom: Spacing.xs,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm as object,
  },
  hoursInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  hoursTitle: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  hoursHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  buttonGroup: {
    marginTop: Spacing.md,
  },
});

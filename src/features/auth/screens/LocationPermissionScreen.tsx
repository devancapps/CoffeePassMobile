import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';
import { Button } from '@/components/Button';

/**
 * Location Permission Screen (PRD C05)
 *
 * Pre-prompt screen explaining why location is needed,
 * shown before the native system dialog.
 * If denied, offers a manual city selection fallback.
 */
interface LocationPermissionScreenProps {
  onGranted: () => void;
  onSkipped: () => void;
}

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onGranted,
  onSkipped,
}) => {
  async function handleRequestPermission(): Promise<void> {
    // TODO: Replace with expo-location requestForegroundPermissionsAsync()
    // For now, simulate granting
    Alert.alert(
      'Location Permission',
      'In a real build, the native location dialog would appear here.',
      [
        { text: 'Simulate Grant', onPress: onGranted },
        { text: 'Simulate Deny', onPress: onSkipped },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustration}>
          <Ionicons name="location" size={80} color={Colors.caramel} />
        </View>

        <Text style={styles.title}>Find Cafes Near You</Text>
        <Text style={styles.subtitle}>
          We use your location to show nearby partner cafes.{'\n'}
          We never share your location data.
        </Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          {[
            { icon: 'map-outline' as const, text: 'See cafes on an interactive map' },
            { icon: 'navigate-outline' as const, text: 'Get walking distance and directions' },
            { icon: 'notifications-outline' as const, text: 'Discover new cafes as they open nearby' },
          ].map((benefit) => (
            <View key={benefit.text} style={styles.benefitRow}>
              <Ionicons name={benefit.icon} size={20} color={Colors.caramel} />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Enable Location"
          onPress={handleRequestPermission}
          variant="primary"
          size="lg"
          fullWidth
          icon="location-outline"
        />
        <View style={styles.spacer} />
        <Button
          title="Not Now — I'll Pick My City"
          onPress={onSkipped}
          variant="ghost"
          size="md"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  illustration: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  benefits: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  benefitText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    flex: 1,
  },
  actions: {
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  spacer: {
    height: Spacing.sm,
  },
});

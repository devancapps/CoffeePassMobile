import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/config/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.stepLabel}>
          {stepLabels[currentStep - 1]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  barBackground: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.caramel,
    borderRadius: 2,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  stepText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.caramel,
  },
  stepLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
  },
});

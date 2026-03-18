import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/config/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info' }) => {
  return (
    <View style={[styles.badge, variantColors[variant].bg]}>
      <Text style={[styles.text, variantColors[variant].text]}>{label}</Text>
    </View>
  );
};

const variantColors: Record<BadgeVariant, { bg: ViewStyle; text: TextStyle }> = {
  success: {
    bg: { backgroundColor: Colors.successLight },
    text: { color: Colors.success },
  },
  warning: {
    bg: { backgroundColor: Colors.warningLight },
    text: { color: Colors.warning },
  },
  error: {
    bg: { backgroundColor: Colors.errorLight },
    text: { color: Colors.error },
  },
  info: {
    bg: { backgroundColor: Colors.gray100 },
    text: { color: Colors.gray700 },
  },
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.xs,
  },
});

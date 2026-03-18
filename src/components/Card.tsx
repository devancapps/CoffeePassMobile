import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '@/config/theme';

type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  onPress?: () => void;
  header?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  onPress,
  header,
  style,
}) => {
  const cardStyle = [
    styles.card,
    Shadows.md as ViewStyle,
    paddingMap[padding],
    style ?? undefined,
  ];

  const content = (
    <>
      {header && <Text style={styles.header}>{header}</Text>}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const paddingMap: Record<CardPadding, ViewStyle> = {
  sm: { padding: Spacing.sm },
  md: { padding: Spacing.md },
  lg: { padding: Spacing.lg },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
  },
});

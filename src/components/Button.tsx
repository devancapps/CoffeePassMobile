import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '@/config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variantStyles[variant].container,
    sizeStyles[size].container,
    fullWidth ? styles.fullWidth : undefined,
    isDisabled ? styles.disabled : undefined,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    variantStyles[variant].text,
    sizeStyles[size].text,
  ];

  const iconColor = variantStyles[variant].text.color as string;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={iconColor}
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={sizeStyles[size].iconSize}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
});

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: Colors.caramel,
    },
    text: {
      color: Colors.white,
      fontFamily: Typography.family.semiBold,
    },
  },
  secondary: {
    container: {
      backgroundColor: Colors.espresso,
    },
    text: {
      color: Colors.white,
      fontFamily: Typography.family.semiBold,
    },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.caramel,
    },
    text: {
      color: Colors.caramel,
      fontFamily: Typography.family.semiBold,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    text: {
      color: Colors.caramel,
      fontFamily: Typography.family.medium,
    },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
  sm: {
    container: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    text: {
      fontSize: Typography.size.sm,
    },
    iconSize: 16,
  },
  md: {
    container: {
      paddingVertical: Spacing.sm + 4,
      paddingHorizontal: Spacing.lg,
    },
    text: {
      fontSize: Typography.size.md,
    },
    iconSize: 20,
  },
  lg: {
    container: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
    },
    text: {
      fontSize: Typography.size.lg,
    },
    iconSize: 24,
  },
};

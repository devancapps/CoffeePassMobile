import { Platform, TextStyle } from 'react-native';

/**
 * CoffeePass Design System
 *
 * Single source of truth for all visual tokens.
 * Derived from CoffeePass brand identity:
 * espresso (primary dark), caramel (accent), cream (background).
 */

export const Colors = {
  // Brand
  espresso: '#3B1F0E',
  espressoLight: '#5C3A20',
  caramel: '#C4883A',
  caramelLight: '#E6A042',
  caramelMuted: '#D4A96A',
  cream: '#FFF8F0',
  creamDark: '#F5EDDF',

  // Neutrals
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray900: '#2D2D2D',
  gray700: '#4A4A4A',
  gray500: '#6B6B6B',
  gray300: '#A0A0A0',
  gray200: '#D1D1D1',
  gray100: '#F2F2F2',

  // Semantic
  success: '#1E6B3C',
  successLight: '#D6EFE1',
  warning: '#D4A017',
  warningLight: '#FFF3CD',
  error: '#C0392B',
  errorLight: '#FADBD8',
  info: '#2980B9',
  infoLight: '#D6EAF8',

  // Overlays
  overlay: 'rgba(59, 31, 14, 0.5)',
  overlayLight: 'rgba(59, 31, 14, 0.15)',
} as const;

export const Typography = {
  family: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 40,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    hero: 48,
  },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
} as const;

/** Pre-built text style presets */
export const TextStyles: Record<string, TextStyle> = {
  hero: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.hero,
    lineHeight: Typography.lineHeight.hero,
    color: Colors.espresso,
  },
  h1: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    lineHeight: Typography.lineHeight.xxl,
    color: Colors.espresso,
  },
  h2: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    lineHeight: Typography.lineHeight.xl,
    color: Colors.espresso,
  },
  h3: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    lineHeight: Typography.lineHeight.lg,
    color: Colors.espresso,
  },
  body: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    color: Colors.gray700,
  },
  bodyMedium: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    lineHeight: Typography.lineHeight.md,
    color: Colors.gray700,
  },
  caption: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: Colors.gray500,
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.lineHeight.sm,
    color: Colors.espresso,
  },
  small: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.lineHeight.xs,
    color: Colors.gray500,
  },
};

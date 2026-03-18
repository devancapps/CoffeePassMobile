import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { UserRole } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import type { AuthScreenProps } from '@/navigation/types';

/**
 * Role Selection Screen (PRD 7.3)
 *
 * Shown after signup. User picks their role, then account is created.
 * "I'm a coffee drinker" → consumer flow
 * "I'm a cafe owner" → cafe onboarding wizard
 */
export const RoleSelectionScreen: React.FC<AuthScreenProps<'RoleSelection'>> = ({
  route,
}) => {
  const { name, email, password } = route.params;
  const { signup, isLoading } = useAuth();

  function handleSelectRole(role: UserRole): void {
    if (isLoading) return;
    signup(email, password, name, role);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>☕</Text>
        <Text style={styles.title}>How will you use CoffeePass?</Text>
        <Text style={styles.subtitle}>
          You can always change this later in settings
        </Text>

        <View style={styles.cards}>
          {/* Consumer */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole(UserRole.CONSUMER)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: Colors.caramel + '20' }]}>
              <Ionicons name="cafe-outline" size={32} color={Colors.caramel} />
            </View>
            <Text style={styles.roleTitle}>I drink coffee</Text>
            <Text style={styles.roleDescription}>
              Discover cafes, buy credits, and redeem drinks at partner shops
            </Text>
            <View style={styles.roleArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.caramel} />
            </View>
          </TouchableOpacity>

          {/* Cafe Owner */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleSelectRole(UserRole.CAFE_OWNER)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: Colors.espresso + '20' }]}>
              <Ionicons name="storefront-outline" size={32} color={Colors.espresso} />
            </View>
            <Text style={styles.roleTitle}>I own a cafe</Text>
            <Text style={styles.roleDescription}>
              List your cafe, manage your menu, and receive weekly payouts
            </Text>
            <View style={styles.roleArrow}>
              <Ionicons name="arrow-forward" size={20} color={Colors.espresso} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.xxl,
  },
  cards: {
    gap: Spacing.md,
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md as object,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.xs,
  },
  roleDescription: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  roleArrow: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
});

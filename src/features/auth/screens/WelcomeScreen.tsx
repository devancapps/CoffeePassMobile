import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/config/theme';
import { APP } from '@/config/constants';
import { Button } from '@/components/Button';
import type { AuthScreenProps } from '@/navigation/types';

export const WelcomeScreen: React.FC<AuthScreenProps<'Welcome'>> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Brand Mark */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>☕</Text>
          <Text style={styles.logoText}>{APP.NAME}</Text>
        </View>

        {/* Value Proposition */}
        <Text style={styles.tagline}>{APP.TAGLINE}</Text>
        <Text style={styles.subtitle}>
          Save on every drink at independent cafes near you.{'\n'}
          Credits work across all partner shops.
        </Text>
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('SignUp')}
          variant="primary"
          size="lg"
          fullWidth
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Button
            title="Log In"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            size="sm"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.espresso,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  logoText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.hero,
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.xl,
    color: Colors.caramel,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.caramelMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    paddingBottom: Spacing.xl,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  loginText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.caramelMuted,
  },
});

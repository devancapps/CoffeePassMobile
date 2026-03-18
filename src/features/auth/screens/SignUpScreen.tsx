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
import { Colors, Typography, Spacing } from '@/config/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword, validateName } from '@/utils/formatting';
import type { AuthScreenProps } from '@/navigation/types';

export const SignUpScreen: React.FC<AuthScreenProps<'SignUp'>> = ({
  navigation,
}) => {
  const { isLoading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const nameResult = validateName(name);
    if (!nameResult.valid) errors.name = nameResult.message;

    if (!validateEmail(email)) errors.email = 'Please enter a valid email';

    const passResult = validatePassword(password);
    if (!passResult.valid) errors.password = passResult.message;

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSignUp(): void {
    clearError();
    if (!validate()) return;
    navigation.navigate('RoleSelection', { name, email, password });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.espresso} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join CoffeePass and start saving on coffee today
          </Text>

          {/* Server error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={(t) => { setName(t); setFieldErrors((e) => ({ ...e, name: '' })); }}
              error={fieldErrors.name}
              leftIcon="person-outline"
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: '' })); }}
              error={fieldErrors.email}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Minimum 8 characters"
              value={password}
              onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: '' })); }}
              error={fieldErrors.password}
              leftIcon="lock-closed-outline"
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setFieldErrors((e) => ({ ...e, confirmPassword: '' })); }}
              error={fieldErrors.confirmPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry
            />
          </View>

          {/* Submit */}
          <Button
            title="Create Account"
            onPress={handleSignUp}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
          />

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.error,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  loginLink: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
});

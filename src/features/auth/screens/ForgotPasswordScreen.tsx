import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/formatting';
import type { AuthScreenProps } from '@/navigation/types';

export const ForgotPasswordScreen: React.FC<AuthScreenProps<'ForgotPassword'>> = ({
  navigation,
}) => {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReset(): Promise<void> {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      Alert.alert(
        'Check Your Email',
        'If an account exists for this email, you will receive a password reset link.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.espresso} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Ionicons
            name="mail-outline"
            size={48}
            color={Colors.caramel}
            style={styles.headerIcon}
          />

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your account and we'll send
            you a link to reset your password.
          </Text>

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setEmailError(''); }}
            error={emailError}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Send Reset Link"
            onPress={handleReset}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
          />

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.lg,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  headerIcon: {
    marginBottom: Spacing.lg,
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
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  backToLogin: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
  },
  backToLoginText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
});

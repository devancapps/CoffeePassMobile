import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/config/constants';

export const ProfileScreen: React.FC = () => {
  const { user, logout, switchRole } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        {/* User Info Card */}
        <Card padding="lg" style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={Colors.white} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName ?? 'Guest'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
        </Card>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>Account</Text>

        <Card padding="sm" style={styles.menuCard}>
          {[
            { icon: 'person-outline' as const, label: 'Edit Profile' },
            { icon: 'notifications-outline' as const, label: 'Notifications' },
            { icon: 'help-circle-outline' as const, label: 'Help & Support' },
            { icon: 'document-text-outline' as const, label: 'Terms of Service' },
          ].map((item, index) => (
            <View key={item.label}>
              <View style={styles.menuItem}>
                <Ionicons name={item.icon} size={22} color={Colors.espresso} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
              </View>
              {index < 3 && <View style={styles.menuDivider} />}
            </View>
          ))}
        </Card>

        {/* DEV: Role Switcher */}
        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>Developer Tools</Text>
            <Card padding="md" style={styles.devCard}>
              <Text style={styles.devLabel}>
                Current Role: {user?.role ?? 'none'}
              </Text>
              <View style={styles.devActions}>
                <Button
                  title="Switch to Cafe Owner"
                  onPress={() => switchRole(UserRole.CAFE_OWNER)}
                  variant="outline"
                  size="sm"
                  fullWidth
                />
              </View>
            </Card>
          </>
        )}

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Log Out"
            onPress={logout}
            variant="ghost"
            icon="log-out-outline"
          />
        </View>

        <Text style={styles.version}>CoffeePass v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userCard: {
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.caramel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  menuCard: {
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuLabel: {
    flex: 1,
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginLeft: Spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginHorizontal: Spacing.sm,
  },
  devCard: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.caramel,
    borderStyle: 'dashed',
  },
  devLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
    marginBottom: Spacing.md,
  },
  devActions: {
    gap: Spacing.sm,
  },
  logoutSection: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  version: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

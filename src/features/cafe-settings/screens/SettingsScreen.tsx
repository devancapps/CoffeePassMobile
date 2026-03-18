/**
 * Cafe Settings Screen (F08)
 *
 * Cafe profile management, business hours, staff,
 * payout configuration, and account settings.
 * PRD Section 6.5: Cafe settings and management.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, PLATFORM, APP } from '@/config/constants';

// ─── Types ───────────────────────────────────────────────

interface CafeProfile {
  name: string;
  description: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  addedAt: Date;
}

// ─── Component ───────────────────────────────────────────

export const CafeSettingsScreen: React.FC = () => {
  const { user, logout, switchRole } = useAuth();

  // Cafe profile state
  const [profile, setProfile] = useState<CafeProfile>({
    name: user?.displayName ?? 'My Cafe',
    description: 'A cozy neighborhood coffee shop serving handcrafted drinks and fresh pastries.',
    phone: '(415) 555-0123',
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94110',
  });

  // Settings toggles
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);

  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profile.name);
  const [editDescription, setEditDescription] = useState(profile.description);
  const [editPhone, setEditPhone] = useState(profile.phone);

  // Mock staff
  const [staff] = useState<StaffMember[]>([
    { id: 'staff_001', name: user?.displayName ?? 'Owner', email: user?.email ?? '', role: 'owner', addedAt: new Date(Date.now() - 60 * 86400000) },
    { id: 'staff_002', name: 'Jamie Rodriguez', email: 'jamie@example.com', role: 'staff', addedAt: new Date(Date.now() - 14 * 86400000) },
  ]);

  const handleSaveProfile = useCallback(() => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Cafe name is required.');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      name: editName.trim(),
      description: editDescription.trim(),
      phone: editPhone.trim(),
    }));
    setShowEditProfile(false);
    Alert.alert('Saved', 'Cafe profile updated successfully.');
  }, [editName, editDescription, editPhone]);

  const handleAddStaff = useCallback(() => {
    Alert.alert(
      'Invite Staff',
      'In the full version, you can invite staff members by email. They\'ll receive an invite to join as a barista on CoffeePass.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleRemoveStaff = useCallback((member: StaffMember) => {
    if (member.role === 'owner') {
      Alert.alert('Cannot Remove', 'You cannot remove the cafe owner.');
      return;
    }
    Alert.alert(
      'Remove Staff',
      `Remove ${member.name} from your cafe? They will no longer be able to process redemptions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {} },
      ]
    );
  }, []);

  const handleConnectStripe = useCallback(() => {
    Alert.alert(
      'Connect Stripe',
      'In the full version, this will redirect you to Stripe Connect onboarding to set up payouts to your bank account.',
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Cafe Profile Card */}
        <Card padding="lg" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.cafeAvatar}>
              <Ionicons name="cafe" size={28} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
              <Badge label="Active" variant="success" />
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => {
              setEditName(profile.name);
              setEditDescription(profile.description);
              setEditPhone(profile.phone);
              setShowEditProfile(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.caramel} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* Order Settings */}
        <Text style={styles.sectionTitle}>Order Settings</Text>
        <Card padding="sm" style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="storefront-outline" size={22} color={Colors.espresso} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Accepting Orders</Text>
                <Text style={styles.settingHint}>Customers can place new orders</Text>
              </View>
            </View>
            <Switch
              value={acceptingOrders}
              onValueChange={setAcceptingOrders}
              trackColor={{ false: Colors.gray200, true: Colors.success + '60' }}
              thumbColor={acceptingOrders ? Colors.success : Colors.gray300}
            />
          </View>
        </Card>

        {/* Cafe Management */}
        <Text style={styles.sectionTitle}>Cafe Management</Text>
        <Card padding="sm" style={styles.menuCard}>
          {[
            { icon: 'storefront-outline' as const, label: 'Edit Cafe Profile', onPress: () => {
              setEditName(profile.name);
              setEditDescription(profile.description);
              setEditPhone(profile.phone);
              setShowEditProfile(true);
            }},
            { icon: 'time-outline' as const, label: 'Business Hours', onPress: () => {
              Alert.alert('Business Hours', 'Hours editing will be available in a future update. Currently using default 7am-6pm schedule.');
            }},
            { icon: 'people-outline' as const, label: 'Staff Management', badge: `${staff.length}`, onPress: () => setShowStaffModal(true) },
            { icon: 'card-outline' as const, label: 'Payout Settings', onPress: handleConnectStripe },
          ].map((item, index, arr) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={22} color={Colors.espresso} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && <Badge label={item.badge} variant="info" />}
                <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
              </TouchableOpacity>
              {index < arr.length - 1 && <View style={styles.menuDivider} />}
            </View>
          ))}
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card padding="sm" style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={Colors.espresso} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingHint}>New orders and redemptions</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.gray200, true: Colors.caramel + '60' }}
              thumbColor={notificationsEnabled ? Colors.caramel : Colors.gray300}
            />
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high-outline" size={22} color={Colors.espresso} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingHint}>Alerts for new redemptions</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: Colors.gray200, true: Colors.caramel + '60' }}
              thumbColor={soundEnabled ? Colors.caramel : Colors.gray300}
            />
          </View>
        </Card>

        {/* Payout Settings */}
        <Text style={styles.sectionTitle}>Payout</Text>
        <Card padding="sm" style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="repeat-outline" size={22} color={Colors.espresso} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Auto Payout</Text>
                <Text style={styles.settingHint}>
                  Weekly on Mondays (min ${(PLATFORM.MIN_PAYOUT_CENTS / 100).toFixed(2)})
                </Text>
              </View>
            </View>
            <Switch
              value={autoPayoutEnabled}
              onValueChange={setAutoPayoutEnabled}
              trackColor={{ false: Colors.gray200, true: Colors.success + '60' }}
              thumbColor={autoPayoutEnabled ? Colors.success : Colors.gray300}
            />
          </View>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleConnectStripe} activeOpacity={0.7}>
            <Ionicons name="logo-usd" size={22} color={Colors.espresso} />
            <Text style={styles.menuLabel}>Connect Bank Account</Text>
            <Badge label="Stripe" variant="info" />
            <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
          </TouchableOpacity>
        </Card>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card padding="sm" style={styles.menuCard}>
          {[
            { icon: 'help-circle-outline' as const, label: 'Help Center' },
            { icon: 'chatbubble-outline' as const, label: 'Contact Support' },
            { icon: 'document-text-outline' as const, label: 'Terms & Conditions' },
            { icon: 'shield-checkmark-outline' as const, label: 'Privacy Policy' },
          ].map((item, index, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Ionicons name={item.icon} size={22} color={Colors.espresso} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
              </TouchableOpacity>
              {index < arr.length - 1 && <View style={styles.menuDivider} />}
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
                  title="Switch to Consumer"
                  onPress={() => switchRole(UserRole.CONSUMER)}
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

        <Text style={styles.version}>{APP.NAME} v{APP.VERSION} — Cafe Owner</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Cafe Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={28} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Cafe Name"
                placeholder="Your cafe's name"
                value={editName}
                onChangeText={setEditName}
                leftIcon="storefront-outline"
              />
              <Input
                label="Description"
                placeholder="Describe your cafe"
                value={editDescription}
                onChangeText={setEditDescription}
                leftIcon="document-text-outline"
              />
              <Input
                label="Phone"
                placeholder="(415) 555-0123"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />

              <View style={styles.addressSection}>
                <Text style={styles.fieldLabel}>Address</Text>
                <Card padding="md" style={styles.addressCard}>
                  <Text style={styles.addressText}>{profile.street}</Text>
                  <Text style={styles.addressText}>
                    {profile.city}, {profile.state} {profile.zipCode}
                  </Text>
                  <Text style={styles.addressHint}>
                    Contact support to update your address
                  </Text>
                </Card>
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon="checkmark-outline"
                />
                <View style={{ height: Spacing.sm }} />
                <Button
                  title="Cancel"
                  onPress={() => setShowEditProfile(false)}
                  variant="ghost"
                  size="md"
                />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Staff Modal */}
      <Modal
        visible={showStaffModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStaffModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Staff Management</Text>
              <TouchableOpacity onPress={() => setShowStaffModal(false)}>
                <Ionicons name="close" size={28} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.staffSubtitle}>
                Staff members can process redemptions on behalf of your cafe.
              </Text>

              {staff.map((member) => (
                <Card key={member.id} padding="md" style={styles.staffCard}>
                  <View style={styles.staffRow}>
                    <View style={styles.staffAvatar}>
                      <Ionicons
                        name={member.role === 'owner' ? 'shield' : 'person'}
                        size={20}
                        color={Colors.white}
                      />
                    </View>
                    <View style={styles.staffInfo}>
                      <View style={styles.staffNameRow}>
                        <Text style={styles.staffName}>{member.name}</Text>
                        <Badge
                          label={member.role === 'owner' ? 'Owner' : 'Staff'}
                          variant={member.role === 'owner' ? 'warning' : 'info'}
                        />
                      </View>
                      <Text style={styles.staffEmail}>{member.email}</Text>
                    </View>
                    {member.role !== 'owner' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveStaff(member)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}

              <Button
                title="Invite Staff Member"
                onPress={handleAddStaff}
                variant="outline"
                size="lg"
                fullWidth
                icon="person-add-outline"
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────

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

  // Profile card
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cafeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.espresso,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  profileName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
  },
  profileEmail: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  editProfileText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },

  // Section
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Settings toggles
  settingsCard: {
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  settingHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: 2,
  },

  // Menu items
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

  // Dev card
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

  // Logout
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

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  modalTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
  },
  modalActions: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  // Address
  addressSection: {
    marginTop: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
  },
  addressCard: {
    backgroundColor: Colors.creamDark,
  },
  addressText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    lineHeight: 22,
  },
  addressHint: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray300,
    marginTop: Spacing.sm,
  },

  // Staff
  staffSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginBottom: Spacing.lg,
  },
  staffCard: {
    marginBottom: Spacing.sm,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.caramel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  staffInfo: {
    flex: 1,
  },
  staffNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  staffName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  staffEmail: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
});

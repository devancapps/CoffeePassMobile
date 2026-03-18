/**
 * Menu Item Detail Screen (C08)
 *
 * Shows full item details with "Redeem" CTA.
 * PRD Section 5.4: Item display with name, description,
 * credit price, photo, and redeem button.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';
import { getMockCafe, getMockMenuItems } from '@/data/mockCafes';
import { isCafeOpen } from '@/utils/cafe';
import { formatCredits } from '@/utils/formatting';
import type { ConsumerStackScreenProps } from '@/navigation/types';

// ─── Component ───────────────────────────────────────────

export const MenuItemDetailScreen: React.FC<
  ConsumerStackScreenProps<'MenuItemDetail'>
> = ({ route, navigation }) => {
  const { cafeId, menuItemId } = route.params;
  const { user, updateCreditBalance } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const cafe = useMemo(() => getMockCafe(cafeId), [cafeId]);
  const menuItem = useMemo(() => {
    const items = getMockMenuItems(cafeId);
    return items.find((i) => i.id === menuItemId);
  }, [cafeId, menuItemId]);

  const isOpen = cafe ? isCafeOpen(cafe.hours) : false;
  const userCredits = user?.creditBalance ?? 0;
  const hasEnoughCredits = menuItem ? userCredits >= menuItem.creditPrice : false;

  const handleRedeem = useCallback(() => {
    if (!menuItem || !cafe) return;

    if (!isOpen) {
      Alert.alert(
        'Cafe Closed',
        `${cafe.name} is currently closed. You can only redeem when the cafe is open.`
      );
      return;
    }

    if (!hasEnoughCredits) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${menuItem.creditPrice} credits but only have ${userCredits}. Buy more credits in your wallet.`,
        [
          { text: 'Go to Wallet', onPress: () => navigation.navigate('ConsumerTabs', { screen: 'Wallet' }) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    Alert.alert(
      'Redeem Item',
      `Use ${menuItem.creditPrice} credits for "${menuItem.name}" at ${cafe.name}?\n\nYou'll receive a QR code to show the barista.`,
      [
        {
          text: 'Redeem',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Mock order creation: debit credits and generate token
              await updateCreditBalance(-menuItem.creditPrice);

              // Generate mock backup code
              const backupCode = String(Math.floor(1000 + Math.random() * 9000));
              const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

              navigation.navigate('RedemptionActive', {
                orderId: `order_${Date.now()}`,
                menuItemName: menuItem.name,
                cafeName: cafe.name,
                creditAmount: menuItem.creditPrice,
                backupCode,
                expiresAt: expiresAt.toISOString(),
              });
            } catch {
              Alert.alert('Error', 'Failed to create order. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [menuItem, cafe, isOpen, hasEnoughCredits, userCredits, navigation, updateCreditBalance]);

  if (!cafe || !menuItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.gray300} />
          <Text style={styles.errorText}>Item not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Back Button */}
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
          icon="arrow-back"
        />

        {/* Item Image Placeholder */}
        <View style={styles.imageContainer}>
          <Ionicons name="restaurant" size={64} color={Colors.caramelMuted} />
        </View>

        {/* Item Info */}
        <View style={styles.infoSection}>
          <View style={styles.categoryRow}>
            <Badge
              label={menuItem.category.charAt(0).toUpperCase() + menuItem.category.slice(1)}
              variant="info"
            />
            {!isOpen && <Badge label="Cafe Closed" variant="error" />}
          </View>

          <Text style={styles.itemName}>{menuItem.name}</Text>

          {menuItem.description ? (
            <Text style={styles.itemDescription}>{menuItem.description}</Text>
          ) : null}

          {/* Price Card */}
          <Card padding="lg" style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceValue}>{menuItem.creditPrice}</Text>
                <Text style={styles.priceUnit}>credits</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRight}>
                <Text style={styles.balanceLabel}>Your Balance</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    !hasEnoughCredits && styles.balanceInsufficient,
                  ]}
                >
                  {formatCredits(userCredits)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Cafe Info */}
          <View style={styles.cafeRow}>
            <Ionicons name="cafe-outline" size={18} color={Colors.gray500} />
            <Text style={styles.cafeNameText}>{cafe.name}</Text>
          </View>
        </View>

        {/* Redeem Button */}
        <View style={styles.actions}>
          {!hasEnoughCredits && (
            <Text style={styles.insufficientText}>
              You need {menuItem.creditPrice - userCredits} more credits
            </Text>
          )}
          <Button
            title={hasEnoughCredits ? `Redeem for ${menuItem.creditPrice} Credits` : 'Buy More Credits'}
            onPress={
              hasEnoughCredits
                ? handleRedeem
                : () => navigation.navigate('ConsumerTabs', { screen: 'Wallet' })
            }
            variant="primary"
            size="lg"
            fullWidth
            icon={hasEnoughCredits ? 'qr-code-outline' : 'wallet-outline'}
            disabled={!isOpen && hasEnoughCredits}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.gray500,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  imageContainer: {
    height: 200,
    backgroundColor: Colors.creamDark,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  infoSection: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
  },
  itemDescription: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray700,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  priceCard: {
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLeft: {
    flex: 1,
    alignItems: 'center',
  },
  priceValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.caramel,
  },
  priceUnit: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.lg,
  },
  priceRight: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.success,
  },
  balanceInsufficient: {
    color: Colors.error,
  },
  cafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cafeNameText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.md,
    color: Colors.gray700,
  },
  actions: {
    paddingBottom: Spacing.xl,
  },
  insufficientText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});

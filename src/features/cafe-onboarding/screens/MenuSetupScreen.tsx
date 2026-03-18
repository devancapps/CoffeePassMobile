import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { OnboardingProgress } from '../components/OnboardingProgress';
import type { CafeOnboardingScreenProps } from '@/navigation/types';

const STEP_LABELS = ['Business Profile', 'Menu Setup', 'Payout Setup', 'Review'];

const CATEGORIES = ['Espresso', 'Brewed', 'Cold', 'Tea', 'Specialty', 'Food', 'Other'] as const;

interface LocalMenuItem {
  id: string;
  name: string;
  creditPrice: string;
  category: string;
}

/**
 * Cafe Onboarding Step 3 — Menu Setup (PRD F05)
 *
 * Minimum 3 menu items to go live.
 * Each item: name, credit price, category.
 */
export const MenuSetupScreen: React.FC<CafeOnboardingScreenProps<'MenuSetup'>> = ({
  navigation,
}) => {
  const [items, setItems] = useState<LocalMenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('');
  const [creditPrice, setCreditPrice] = useState('');
  const [category, setCategory] = useState('Espresso');

  const minItems = 3;
  const canProceed = items.length >= minItems;

  function handleAddItem(): void {
    if (!itemName.trim()) {
      Alert.alert('Missing Name', 'Please enter an item name.');
      return;
    }
    const price = parseInt(creditPrice, 10);
    if (!price || price < 1 || price > 99) {
      Alert.alert('Invalid Price', 'Credit price must be between 1 and 99.');
      return;
    }

    const newItem: LocalMenuItem = {
      id: `item_${Date.now()}`,
      name: itemName.trim(),
      creditPrice: creditPrice,
      category,
    };

    setItems((prev) => [...prev, newItem]);
    setItemName('');
    setCreditPrice('');
    setCategory('Espresso');
    setShowForm(false);
  }

  function handleRemoveItem(id: string): void {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleNext(): void {
    if (!canProceed) {
      Alert.alert(
        'More Items Needed',
        `Add at least ${minItems - items.length} more item${minItems - items.length > 1 ? 's' : ''} to continue.`,
      );
      return;
    }
    // TODO: Save menu items to Firestore
    navigation.navigate('PayoutSetup');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OnboardingProgress currentStep={2} totalSteps={4} stepLabels={STEP_LABELS} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Build your menu</Text>
        <Text style={styles.subtitle}>
          Add your drinks and food items. Customers browse these to decide what to redeem.
        </Text>

        {/* Guidance */}
        <View style={styles.guidance}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.caramel} />
          <Text style={styles.guidanceText}>
            Set credit prices close to your cash price. 1 credit ≈ $1.{'\n'}
            A $5 latte = 5 credits.
          </Text>
        </View>

        {/* Progress toward minimum */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {items.length} of {minItems} minimum items added
          </Text>
          {canProceed && <Badge label="Ready!" variant="success" />}
        </View>

        {/* Item List */}
        {items.map((item) => (
          <Card key={item.id} padding="md" style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemMeta}>
                  <Badge label={item.category} variant="info" />
                  <Text style={styles.itemPrice}>{item.creditPrice} credits</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* Add Item Form */}
        {showForm ? (
          <Card padding="lg" style={styles.formCard}>
            <Text style={styles.formTitle}>New Menu Item</Text>

            <Input
              label="Item Name"
              placeholder="e.g. House Latte"
              value={itemName}
              onChangeText={setItemName}
              leftIcon="restaurant-outline"
              maxLength={60}
            />

            <Input
              label="Credit Price"
              placeholder="e.g. 5"
              value={creditPrice}
              onChangeText={(t) => setCreditPrice(t.replace(/[^0-9]/g, ''))}
              leftIcon="pricetag-outline"
              keyboardType="number-pad"
              maxLength={2}
            />

            {/* Category Selector */}
            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <Button title="Add Item" onPress={handleAddItem} variant="primary" size="md" />
              <View style={{ width: Spacing.sm }} />
              <Button title="Cancel" onPress={() => setShowForm(false)} variant="ghost" size="md" />
            </View>
          </Card>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.caramel} />
            <Text style={styles.addButtonText}>Add Menu Item</Text>
          </TouchableOpacity>
        )}

        {/* Continue */}
        <View style={styles.buttonGroup}>
          <Button
            title={canProceed ? 'Continue to Payout Setup' : `Add ${minItems - items.length} more item${minItems - items.length > 1 ? 's' : ''}`}
            onPress={handleNext}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canProceed}
            icon="arrow-forward"
          />
          <View style={styles.backRow}>
            <Button
              title="Back"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="sm"
              icon="arrow-back"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  guidance: {
    flexDirection: 'row',
    backgroundColor: Colors.caramel + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  guidanceText: {
    flex: 1,
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  itemCard: { marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    marginBottom: Spacing.xs,
  },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemPrice: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.caramel,
  },
  removeButton: { padding: Spacing.xs },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.caramel,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  addButtonText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.caramel,
  },
  formCard: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  formTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.espresso,
    marginBottom: Spacing.md,
  },
  categoryLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  categoryChipActive: {
    borderColor: Colors.caramel,
    backgroundColor: Colors.caramel + '15',
  },
  categoryChipText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  categoryChipTextActive: {
    color: Colors.caramel,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonGroup: { marginTop: Spacing.lg },
  backRow: { alignItems: 'center', marginTop: Spacing.md },
});

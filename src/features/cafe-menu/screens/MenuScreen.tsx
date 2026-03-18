/**
 * Cafe Menu Management Screen (F05)
 *
 * Cafe owners manage their menu items here: view by category,
 * toggle availability, add/edit items with mock CRUD.
 * PRD Section 6.3: Menu management with categories, pricing.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/config/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { MenuCategory } from '@/config/constants';
import { getMockCafeMenuItems } from '@/data/mockCafeDashboard';
import type { MenuItem } from '@/models';

// ─── Category Labels ─────────────────────────────────────

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  [MenuCategory.ESPRESSO]: 'Espresso',
  [MenuCategory.BREWED]: 'Brewed',
  [MenuCategory.COLD]: 'Cold',
  [MenuCategory.TEA]: 'Tea',
  [MenuCategory.SPECIALTY]: 'Specialty',
  [MenuCategory.FOOD]: 'Food',
  [MenuCategory.OTHER]: 'Other',
};

const CATEGORY_ICONS: Record<MenuCategory, keyof typeof Ionicons.glyphMap> = {
  [MenuCategory.ESPRESSO]: 'cafe-outline',
  [MenuCategory.BREWED]: 'water-outline',
  [MenuCategory.COLD]: 'snow-outline',
  [MenuCategory.TEA]: 'leaf-outline',
  [MenuCategory.SPECIALTY]: 'sparkles-outline',
  [MenuCategory.FOOD]: 'fast-food-outline',
  [MenuCategory.OTHER]: 'ellipsis-horizontal-outline',
};

// ─── Component ───────────────────────────────────────────

export const CafeMenuScreen: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getMockCafeMenuItems());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<MenuCategory>(MenuCategory.ESPRESSO);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: { category: MenuCategory; label: string; items: MenuItem[] }[] = [];
    const categoryOrder = [
      MenuCategory.ESPRESSO,
      MenuCategory.BREWED,
      MenuCategory.COLD,
      MenuCategory.TEA,
      MenuCategory.SPECIALTY,
      MenuCategory.FOOD,
      MenuCategory.OTHER,
    ];

    for (const cat of categoryOrder) {
      const items = menuItems.filter((i) => i.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, label: CATEGORY_LABELS[cat], items });
      }
    }
    return groups;
  }, [menuItems]);

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.available).length;

  const resetForm = useCallback(() => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory(MenuCategory.ESPRESSO);
    setEditingItem(null);
  }, []);

  const handleOpenAdd = useCallback(() => {
    resetForm();
    setShowAddModal(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description ?? '');
    setFormPrice(String(item.creditPrice));
    setFormCategory(item.category);
    setShowAddModal(true);
  }, []);

  const handleSave = useCallback(() => {
    const price = parseInt(formPrice, 10);
    if (!formName.trim() || isNaN(price) || price < 1) {
      Alert.alert('Invalid', 'Please enter a name and valid credit price (1+).');
      return;
    }

    const now = new Date();
    if (editingItem) {
      // Update existing
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, name: formName.trim(), description: formDescription.trim() || undefined, creditPrice: price, category: formCategory, updatedAt: now }
            : item
        )
      );
    } else {
      // Add new
      const newItem: MenuItem = {
        id: `cmi_${Date.now()}`,
        cafeId: 'my_cafe',
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        creditPrice: price,
        category: formCategory,
        available: true,
        sortOrder: menuItems.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      setMenuItems((prev) => [...prev, newItem]);
    }

    setShowAddModal(false);
    resetForm();
  }, [formName, formDescription, formPrice, formCategory, editingItem, menuItems.length, resetForm]);

  const handleToggleAvailable = useCallback((itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, available: !item.available, updatedAt: new Date() }
          : item
      )
    );
  }, []);

  const handleDelete = useCallback((item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Remove "${item.name}" from your menu? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMenuItems((prev) => prev.filter((i) => i.id !== item.id));
          },
        },
      ]
    );
  }, []);

  // ─── Render ──────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Menu</Text>
          <Text style={styles.subtitle}>
            {availableItems}/{totalItems} items available
          </Text>
        </View>
        <Button
          title="Add Item"
          onPress={handleOpenAdd}
          variant="primary"
          size="sm"
          icon="add-outline"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedItems.map((group) => (
          <View key={group.category} style={styles.categorySection}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <Ionicons
                name={CATEGORY_ICONS[group.category]}
                size={20}
                color={Colors.caramel}
              />
              <Text style={styles.categoryTitle}>{group.label}</Text>
              <Badge label={`${group.items.length}`} variant="info" />
            </View>

            {/* Items */}
            {group.items.map((item) => (
              <Card
                key={item.id}
                padding="md"
                style={item.available ? styles.itemCard : { ...styles.itemCard, ...styles.itemCardUnavailable }}
              >
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemInfo}>
                    <View style={styles.itemNameRow}>
                      <Text style={item.available ? styles.itemName : { ...styles.itemName, ...styles.itemNameUnavailable }}>
                        {item.name}
                      </Text>
                      {!item.available && (
                        <Badge label="Unavailable" variant="error" />
                      )}
                    </View>
                    {item.description ? (
                      <Text style={styles.itemDescription} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.itemActions}>
                    <Text style={styles.itemPrice}>
                      {item.creditPrice}
                      <Text style={styles.itemPriceUnit}> cr</Text>
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Action buttons */}
                <View style={styles.itemButtons}>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => handleToggleAvailable(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.available ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={item.available ? Colors.success : Colors.gray300}
                    />
                    <Text style={item.available ? styles.toggleText : { ...styles.toggleText, color: Colors.gray300 }}>
                      {item.available ? 'Available' : 'Hidden'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil-outline" size={16} color={Colors.gray500} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ))}

        {menuItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={Colors.gray300} />
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptySubtext}>
              Add your drinks and food items so customers can discover them on CoffeePass.
            </Text>
            <Button
              title="Add First Item"
              onPress={handleOpenAdd}
              variant="primary"
              icon="add-outline"
            />
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Item' : 'Add Menu Item'}
              </Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                <Ionicons name="close" size={28} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Item Name"
                placeholder="e.g., Vanilla Latte"
                value={formName}
                onChangeText={setFormName}
                leftIcon="text-outline"
              />

              <Input
                label="Description (optional)"
                placeholder="Short description of this item"
                value={formDescription}
                onChangeText={setFormDescription}
                leftIcon="document-text-outline"
              />

              <Input
                label="Credit Price"
                placeholder="e.g., 5"
                value={formPrice}
                onChangeText={(text) => setFormPrice(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                leftIcon="pricetag-outline"
              />

              {/* Category Picker */}
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryPicker}>
                {Object.values(MenuCategory).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={formCategory === cat ? { ...styles.categoryChip, ...styles.categoryChipSelected } : styles.categoryChip}
                    onPress={() => setFormCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[cat]}
                      size={16}
                      color={formCategory === cat ? Colors.white : Colors.gray500}
                    />
                    <Text
                      style={formCategory === cat ? { ...styles.categoryChipText, ...styles.categoryChipTextSelected } : styles.categoryChipText}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title={editingItem ? 'Save Changes' : 'Add Item'}
                  onPress={handleSave}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={editingItem ? 'checkmark-outline' : 'add-outline'}
                />
                <View style={{ height: Spacing.sm }} />
                <Button
                  title="Cancel"
                  onPress={() => { setShowAddModal(false); resetForm(); }}
                  variant="ghost"
                  size="md"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xxl,
    color: Colors.espresso,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Category sections
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
    flex: 1,
  },

  // Item cards
  itemCard: {
    marginBottom: Spacing.sm,
  },
  itemCardUnavailable: {
    opacity: 0.6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  itemName: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.md,
    color: Colors.espresso,
  },
  itemNameUnavailable: {
    color: Colors.gray300,
  },
  itemDescription: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.caramel,
  },
  itemPriceUnit: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },

  // Item action buttons
  itemButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  toggleText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.xs,
    color: Colors.success,
  },
  editBtn: {
    padding: Spacing.xs,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.gray500,
  },
  emptySubtext: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.gray300,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
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

  // Form
  fieldLabel: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.espresso,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  categoryChipSelected: {
    backgroundColor: Colors.caramel,
    borderColor: Colors.caramel,
  },
  categoryChipText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
  categoryChipTextSelected: {
    color: Colors.white,
  },
  modalActions: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});

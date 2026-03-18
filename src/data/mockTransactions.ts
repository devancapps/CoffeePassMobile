/**
 * Mock Transaction Data
 *
 * Sample credit purchases, ledger entries, and orders
 * for development and testing.
 */

import { LedgerEntryType, OrderStatus, MenuCategory } from '@/config/constants';
import type { CreditPurchase, CreditLedgerEntry, Order } from '@/models';

// ─── Mock Credit Ledger ──────────────────────────────────

export const MOCK_LEDGER_ENTRIES: CreditLedgerEntry[] = [
  {
    id: 'ledger_001',
    userId: 'mock_user',
    type: LedgerEntryType.PURCHASE,
    amount: 24,
    balanceAfter: 24,
    referenceId: 'purchase_001',
    description: 'Purchased Value bundle',
    createdAt: new Date(Date.now() - 7 * 86400000), // 7 days ago
  },
  {
    id: 'ledger_002',
    userId: 'mock_user',
    type: LedgerEntryType.REDEMPTION,
    amount: -5,
    balanceAfter: 19,
    referenceId: 'order_001',
    description: 'Classic Latte at The Daily Grind',
    createdAt: new Date(Date.now() - 5 * 86400000),
  },
  {
    id: 'ledger_003',
    userId: 'mock_user',
    type: LedgerEntryType.REDEMPTION,
    amount: -6,
    balanceAfter: 13,
    referenceId: 'order_002',
    description: 'Matcha Latte at The Daily Grind',
    createdAt: new Date(Date.now() - 3 * 86400000),
  },
  {
    id: 'ledger_004',
    userId: 'mock_user',
    type: LedgerEntryType.PURCHASE,
    amount: 11,
    balanceAfter: 24,
    referenceId: 'purchase_002',
    description: 'Purchased Regular bundle',
    createdAt: new Date(Date.now() - 2 * 86400000),
  },
  {
    id: 'ledger_005',
    userId: 'mock_user',
    type: LedgerEntryType.REDEMPTION,
    amount: -5,
    balanceAfter: 19,
    referenceId: 'order_003',
    description: 'Cold Brew at Brew & Bean',
    createdAt: new Date(Date.now() - 1 * 86400000),
  },
];

// ─── Mock Credit Purchases ───────────────────────────────

export const MOCK_PURCHASES: CreditPurchase[] = [
  {
    id: 'purchase_001',
    userId: 'mock_user',
    bundleName: 'Value',
    amountPaidCents: 1999,
    creditsIssued: 24,
    stripePaymentIntentId: 'pi_mock_001',
    status: 'completed',
    expiresAt: new Date(Date.now() + 365 * 86400000),
    createdAt: new Date(Date.now() - 7 * 86400000),
  },
  {
    id: 'purchase_002',
    userId: 'mock_user',
    bundleName: 'Regular',
    amountPaidCents: 999,
    creditsIssued: 11,
    stripePaymentIntentId: 'pi_mock_002',
    status: 'completed',
    expiresAt: new Date(Date.now() + 365 * 86400000),
    createdAt: new Date(Date.now() - 2 * 86400000),
  },
];

// ─── Mock Orders ─────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order_001',
    userId: 'mock_user',
    cafeId: 'cafe_001',
    menuItemId: 'mi_003',
    menuItemName: 'Classic Latte',
    creditAmount: 5,
    status: OrderStatus.REDEEMED,
    createdAt: new Date(Date.now() - 5 * 86400000),
    redeemedAt: new Date(Date.now() - 5 * 86400000 + 600000),
  },
  {
    id: 'order_002',
    userId: 'mock_user',
    cafeId: 'cafe_001',
    menuItemId: 'mi_008',
    menuItemName: 'Matcha Latte',
    creditAmount: 6,
    status: OrderStatus.REDEEMED,
    createdAt: new Date(Date.now() - 3 * 86400000),
    redeemedAt: new Date(Date.now() - 3 * 86400000 + 480000),
  },
  {
    id: 'order_003',
    userId: 'mock_user',
    cafeId: 'cafe_002',
    menuItemId: 'mi_024',
    menuItemName: 'Nitro Cold Brew',
    creditAmount: 6,
    status: OrderStatus.REDEEMED,
    createdAt: new Date(Date.now() - 1 * 86400000),
    redeemedAt: new Date(Date.now() - 1 * 86400000 + 300000),
  },
  {
    id: 'order_004',
    userId: 'mock_user',
    cafeId: 'cafe_003',
    menuItemId: 'mi_030',
    menuItemName: 'Lavender Honey Latte',
    creditAmount: 7,
    status: OrderStatus.CREATED,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
];

// ─── Cafe Name Map ───────────────────────────────────────

export const CAFE_NAME_MAP: Record<string, string> = {
  cafe_001: 'The Daily Grind',
  cafe_002: 'Brew & Bean',
  cafe_003: 'Morning Pour',
  cafe_004: 'Foggy Roast',
  cafe_005: 'Pacific Perk',
  cafe_006: 'The Coffee Lab',
  cafe_007: 'Nob Hill Brews',
  cafe_008: 'Castro Coffee Co.',
};

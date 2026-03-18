/**
 * CoffeePass Data Models
 *
 * TypeScript interfaces matching the Firestore document schemas
 * defined in PRD Section 10. These are the canonical type definitions
 * used across the entire app.
 */

import {
  UserRole,
  OrderStatus,
  CafeStatus,
  PayoutStatus,
  LedgerEntryType,
  MenuCategory,
} from '@/config/constants';

// ─── Sub-types ───────────────────────────────────────────

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  geohash: string;
}

export interface DayHours {
  open: string;   // "07:00"
  close: string;  // "18:00"
  closed: boolean;
}

export type WeeklyHours = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DayHours;
};

// ─── User ────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  cafeId?: string;           // Only for cafe_owner / cafe_staff
  creditBalance: number;     // Only for consumers
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  fcmToken?: string;
  authProvider: 'email' | 'google' | 'apple';
}

// ─── Cafe ────────────────────────────────────────────────

export interface Cafe {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  photoUrl?: string;
  phone: string;
  status: CafeStatus;
  platformFeeRate: number;    // 0.20 standard, 0.12 founder
  founderRateExpiresAt?: Date;
  stripeConnectAccountId?: string;
  address: Address;
  location: GeoLocation;
  hours: WeeklyHours;
  menuItemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Menu Item ───────────────────────────────────────────

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  description?: string;
  creditPrice: number;
  category: MenuCategory;
  photoUrl?: string;
  available: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Order ───────────────────────────────────────────────

export interface Order {
  id: string;
  userId: string;
  cafeId: string;
  menuItemId: string;
  menuItemName: string;
  creditAmount: number;
  status: OrderStatus;
  redemptionTokenId?: string;
  payoutStatus?: 'pending' | 'included' | 'paid';
  payoutId?: string;
  createdAt: Date;
  redeemedAt?: Date;
  expiredAt?: Date;
  cancelledAt?: Date;
}

// ─── Redemption Token ────────────────────────────────────

export interface RedemptionToken {
  id: string;
  orderId: string;
  cafeId: string;
  userId: string;
  qrPayload: string;          // Base64-encoded QR data
  backupCode: string;          // 4-digit code
  expiresAt: Date;
  redeemed: boolean;
  redeemedAt?: Date;
  createdAt: Date;
}

// ─── Credit Purchase ─────────────────────────────────────

export interface CreditPurchase {
  id: string;
  userId: string;
  bundleName: string;
  amountPaidCents: number;
  creditsIssued: number;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  expiresAt: Date;
  createdAt: Date;
}

// ─── Credit Ledger Entry ─────────────────────────────────

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  type: LedgerEntryType;
  amount: number;              // Positive = credit added, negative = deducted
  balanceAfter: number;
  referenceId: string;         // orderId, purchaseId, etc.
  description: string;
  createdAt: Date;
}

// ─── Payout ──────────────────────────────────────────────

export interface Payout {
  id: string;
  cafeId: string;
  periodStart: Date;
  periodEnd: Date;
  totalCreditsRedeemed: number;
  payoutAmountCents: number;
  platformFeeCents: number;
  platformFeeRate: number;
  orderCount: number;
  stripeTransferId?: string;
  status: PayoutStatus;
  createdAt: Date;
  completedAt?: Date;
}

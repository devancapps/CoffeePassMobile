/**
 * CoffeePass Application Constants
 *
 * All enums, credit bundles, and magic values live here.
 * Matches PRD Section 8 (Monetary Logic) and Section 10 (Data Model).
 */

// ─── Roles ───────────────────────────────────────────────

export enum UserRole {
  CONSUMER = 'consumer',
  CAFE_OWNER = 'cafe_owner',
  CAFE_STAFF = 'cafe_staff',
  ADMIN = 'admin',
}

// ─── Order Lifecycle ─────────────────────────────────────

export enum OrderStatus {
  CREATED = 'CREATED',
  READY_FOR_REDEMPTION = 'READY_FOR_REDEMPTION',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ─── Cafe Status ─────────────────────────────────────────

export enum CafeStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

// ─── Payout Status ───────────────────────────────────────

export enum PayoutStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ─── Credit Ledger Types ─────────────────────────────────

export enum LedgerEntryType {
  PURCHASE = 'PURCHASE',
  REDEMPTION = 'REDEMPTION',
  REFUND_EXPIRY = 'REFUND_EXPIRY',
  REFUND_CANCELLATION = 'REFUND_CANCELLATION',
  PURCHASE_REFUND = 'PURCHASE_REFUND',
  DISPUTE_CREDIT = 'DISPUTE_CREDIT',
  CHARGEBACK = 'CHARGEBACK',
  CREDIT_EXPIRY = 'CREDIT_EXPIRY',
}

// ─── Menu Categories ─────────────────────────────────────

export enum MenuCategory {
  ESPRESSO = 'espresso',
  BREWED = 'brewed',
  COLD = 'cold',
  TEA = 'tea',
  SPECIALTY = 'specialty',
  FOOD = 'food',
  OTHER = 'other',
}

// ─── Credit Bundles ──────────────────────────────────────

export interface CreditBundle {
  id: string;
  name: string;
  priceCents: number;
  credits: number;
  pricePerCredit: number;
  discountPercent: number;
}

export const CREDIT_BUNDLES: CreditBundle[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceCents: 499,
    credits: 5,
    pricePerCredit: 1.0,
    discountPercent: 0,
  },
  {
    id: 'regular',
    name: 'Regular',
    priceCents: 999,
    credits: 11,
    pricePerCredit: 0.91,
    discountPercent: 9,
  },
  {
    id: 'value',
    name: 'Value',
    priceCents: 1999,
    credits: 24,
    pricePerCredit: 0.83,
    discountPercent: 17,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceCents: 3999,
    credits: 50,
    pricePerCredit: 0.80,
    discountPercent: 20,
  },
  {
    id: 'super_pro',
    name: 'Super Pro',
    priceCents: 7499,
    credits: 100,
    pricePerCredit: 0.75,
    discountPercent: 25,
  },
];

// ─── Platform Economics ──────────────────────────────────

export const PLATFORM = {
  /** Standard platform fee: 20% */
  STANDARD_FEE_RATE: 0.20,
  /** Founder promotional rate: 12% */
  FOUNDER_FEE_RATE: 0.12,
  /** Standard payout per credit to cafe */
  STANDARD_PAYOUT_PER_CREDIT: 0.80,
  /** Founder payout per credit to cafe */
  FOUNDER_PAYOUT_PER_CREDIT: 0.88,
  /** Founder rate duration in months */
  FOUNDER_RATE_MONTHS: 6,
  /** Minimum payout threshold in cents */
  MIN_PAYOUT_CENTS: 500,
  /** Credit expiry in months */
  CREDIT_EXPIRY_MONTHS: 12,
} as const;

// ─── Redemption ──────────────────────────────────────────

export const REDEMPTION = {
  /** Token time-to-live in minutes */
  TOKEN_TTL_MINUTES: 15,
  /** Backup code length */
  BACKUP_CODE_LENGTH: 4,
} as const;

// ─── App Metadata ────────────────────────────────────────

export const APP = {
  NAME: 'CoffeePass',
  TAGLINE: 'Discover Local Coffee',
  SUPPORT_EMAIL: 'support@coffeepass.app',
  VERSION: '0.1.0',
} as const;

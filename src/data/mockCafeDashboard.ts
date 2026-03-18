/**
 * Mock Cafe Dashboard Data
 *
 * Simulated analytics, activity feed, menu items,
 * and payout data for the cafe owner experience.
 */

import { OrderStatus, MenuCategory, PayoutStatus, PLATFORM } from '@/config/constants';
import type { MenuItem, Order, Payout } from '@/models';

// ─── Dashboard Stats ────────────────────────────────────

export interface DashboardStats {
  todayRevenueCents: number;
  todayOrders: number;
  todayRedemptions: number;
  weekRevenueCents: number;
  weekOrders: number;
  pendingPayoutCents: number;
  averageOrderCredits: number;
  repeatCustomerRate: number;
}

export function getMockDashboardStats(): DashboardStats {
  return {
    todayRevenueCents: 3280,
    todayOrders: 7,
    todayRedemptions: 5,
    weekRevenueCents: 18640,
    weekOrders: 32,
    pendingPayoutCents: 14912, // weekRevenueCents * 0.80
    averageOrderCredits: 5.8,
    repeatCustomerRate: 0.42,
  };
}

// ─── Activity Feed ──────────────────────────────────────

export interface ActivityFeedItem {
  id: string;
  type: 'redemption' | 'new_order' | 'expired' | 'cancelled';
  customerName: string;
  menuItemName: string;
  creditAmount: number;
  timestamp: Date;
}

export function getMockActivityFeed(): ActivityFeedItem[] {
  const now = Date.now();
  return [
    {
      id: 'act_001',
      type: 'redemption',
      customerName: 'Sarah M.',
      menuItemName: 'Oat Milk Latte',
      creditAmount: 6,
      timestamp: new Date(now - 8 * 60000), // 8 min ago
    },
    {
      id: 'act_002',
      type: 'redemption',
      customerName: 'Mike T.',
      menuItemName: 'Classic Espresso',
      creditAmount: 4,
      timestamp: new Date(now - 22 * 60000),
    },
    {
      id: 'act_003',
      type: 'new_order',
      customerName: 'Jordan L.',
      menuItemName: 'Cold Brew',
      creditAmount: 5,
      timestamp: new Date(now - 35 * 60000),
    },
    {
      id: 'act_004',
      type: 'redemption',
      customerName: 'Emma K.',
      menuItemName: 'Matcha Latte',
      creditAmount: 6,
      timestamp: new Date(now - 52 * 60000),
    },
    {
      id: 'act_005',
      type: 'expired',
      customerName: 'Alex R.',
      menuItemName: 'Cappuccino',
      creditAmount: 5,
      timestamp: new Date(now - 90 * 60000),
    },
    {
      id: 'act_006',
      type: 'redemption',
      customerName: 'Chris W.',
      menuItemName: 'Pour Over',
      creditAmount: 7,
      timestamp: new Date(now - 120 * 60000),
    },
    {
      id: 'act_007',
      type: 'redemption',
      customerName: 'Lisa P.',
      menuItemName: 'Classic Latte',
      creditAmount: 5,
      timestamp: new Date(now - 180 * 60000),
    },
    {
      id: 'act_008',
      type: 'cancelled',
      customerName: 'David H.',
      menuItemName: 'Iced Americano',
      creditAmount: 4,
      timestamp: new Date(now - 240 * 60000),
    },
  ];
}

// ─── Cafe Menu Items (Owner View) ───────────────────────

export function getMockCafeMenuItems(): MenuItem[] {
  const now = new Date();
  const created = new Date(Date.now() - 30 * 86400000);
  return [
    // Espresso
    {
      id: 'cmi_001',
      cafeId: 'my_cafe',
      name: 'Classic Espresso',
      description: 'Double shot of our house blend, served straight.',
      creditPrice: 4,
      category: MenuCategory.ESPRESSO,
      available: true,
      sortOrder: 1,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_002',
      cafeId: 'my_cafe',
      name: 'Classic Latte',
      description: 'Espresso with steamed milk and light foam.',
      creditPrice: 5,
      category: MenuCategory.ESPRESSO,
      available: true,
      sortOrder: 2,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_003',
      cafeId: 'my_cafe',
      name: 'Cappuccino',
      description: 'Equal parts espresso, steamed milk, and foam.',
      creditPrice: 5,
      category: MenuCategory.ESPRESSO,
      available: true,
      sortOrder: 3,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_004',
      cafeId: 'my_cafe',
      name: 'Oat Milk Latte',
      description: 'Our house espresso with creamy oat milk.',
      creditPrice: 6,
      category: MenuCategory.ESPRESSO,
      available: true,
      sortOrder: 4,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_005',
      cafeId: 'my_cafe',
      name: 'Flat White',
      description: 'Ristretto with velvety microfoam milk.',
      creditPrice: 5,
      category: MenuCategory.ESPRESSO,
      available: false,
      sortOrder: 5,
      createdAt: created,
      updatedAt: now,
    },
    // Brewed
    {
      id: 'cmi_006',
      cafeId: 'my_cafe',
      name: 'Drip Coffee',
      description: 'Fresh-brewed house coffee, light or dark roast.',
      creditPrice: 3,
      category: MenuCategory.BREWED,
      available: true,
      sortOrder: 6,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_007',
      cafeId: 'my_cafe',
      name: 'Pour Over',
      description: 'Single-origin hand-poured coffee. Ask for today\'s selection.',
      creditPrice: 7,
      category: MenuCategory.BREWED,
      available: true,
      sortOrder: 7,
      createdAt: created,
      updatedAt: now,
    },
    // Cold
    {
      id: 'cmi_008',
      cafeId: 'my_cafe',
      name: 'Cold Brew',
      description: '24-hour cold-steeped, smooth and bold.',
      creditPrice: 5,
      category: MenuCategory.COLD,
      available: true,
      sortOrder: 8,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_009',
      cafeId: 'my_cafe',
      name: 'Iced Americano',
      description: 'Espresso over ice with cold water.',
      creditPrice: 4,
      category: MenuCategory.COLD,
      available: true,
      sortOrder: 9,
      createdAt: created,
      updatedAt: now,
    },
    // Specialty
    {
      id: 'cmi_010',
      cafeId: 'my_cafe',
      name: 'Matcha Latte',
      description: 'Ceremonial-grade matcha with steamed milk.',
      creditPrice: 6,
      category: MenuCategory.SPECIALTY,
      available: true,
      sortOrder: 10,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_011',
      cafeId: 'my_cafe',
      name: 'Chai Latte',
      description: 'House-made spiced chai concentrate with steamed milk.',
      creditPrice: 5,
      category: MenuCategory.SPECIALTY,
      available: true,
      sortOrder: 11,
      createdAt: created,
      updatedAt: now,
    },
    // Food
    {
      id: 'cmi_012',
      cafeId: 'my_cafe',
      name: 'Almond Croissant',
      description: 'Buttery croissant filled with almond cream.',
      creditPrice: 4,
      category: MenuCategory.FOOD,
      available: true,
      sortOrder: 12,
      createdAt: created,
      updatedAt: now,
    },
    {
      id: 'cmi_013',
      cafeId: 'my_cafe',
      name: 'Avocado Toast',
      description: 'Sourdough with smashed avocado, everything seasoning.',
      creditPrice: 7,
      category: MenuCategory.FOOD,
      available: true,
      sortOrder: 13,
      createdAt: created,
      updatedAt: now,
    },
  ];
}

// ─── Mock Payouts ───────────────────────────────────────

export function getMockPayouts(): Payout[] {
  return [
    {
      id: 'payout_001',
      cafeId: 'my_cafe',
      periodStart: new Date(Date.now() - 14 * 86400000),
      periodEnd: new Date(Date.now() - 7 * 86400000),
      totalCreditsRedeemed: 87,
      payoutAmountCents: 6960,  // 87 * $0.80
      platformFeeCents: 1740,   // 87 * $0.20
      platformFeeRate: PLATFORM.STANDARD_FEE_RATE,
      orderCount: 18,
      stripeTransferId: 'tr_mock_001',
      status: PayoutStatus.COMPLETED,
      createdAt: new Date(Date.now() - 6 * 86400000),
      completedAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      id: 'payout_002',
      cafeId: 'my_cafe',
      periodStart: new Date(Date.now() - 21 * 86400000),
      periodEnd: new Date(Date.now() - 14 * 86400000),
      totalCreditsRedeemed: 64,
      payoutAmountCents: 5120,
      platformFeeCents: 1280,
      platformFeeRate: PLATFORM.STANDARD_FEE_RATE,
      orderCount: 12,
      stripeTransferId: 'tr_mock_002',
      status: PayoutStatus.COMPLETED,
      createdAt: new Date(Date.now() - 13 * 86400000),
      completedAt: new Date(Date.now() - 12 * 86400000),
    },
    {
      id: 'payout_003',
      cafeId: 'my_cafe',
      periodStart: new Date(Date.now() - 28 * 86400000),
      periodEnd: new Date(Date.now() - 21 * 86400000),
      totalCreditsRedeemed: 53,
      payoutAmountCents: 4240,
      platformFeeCents: 1060,
      platformFeeRate: PLATFORM.STANDARD_FEE_RATE,
      orderCount: 10,
      stripeTransferId: 'tr_mock_003',
      status: PayoutStatus.COMPLETED,
      createdAt: new Date(Date.now() - 20 * 86400000),
      completedAt: new Date(Date.now() - 19 * 86400000),
    },
  ];
}

// ─── Weekly Summary ─────────────────────────────────────

export interface WeeklySummary {
  weekLabel: string;
  orderCount: number;
  creditsRedeemed: number;
  revenueCents: number;
  payoutCents: number;
}

export function getMockWeeklySummaries(): WeeklySummary[] {
  return [
    { weekLabel: 'This Week', orderCount: 32, creditsRedeemed: 186, revenueCents: 18640, payoutCents: 14912 },
    { weekLabel: 'Last Week', orderCount: 18, creditsRedeemed: 87, revenueCents: 8700, payoutCents: 6960 },
    { weekLabel: '2 Weeks Ago', orderCount: 12, creditsRedeemed: 64, revenueCents: 6400, payoutCents: 5120 },
    { weekLabel: '3 Weeks Ago', orderCount: 10, creditsRedeemed: 53, revenueCents: 5300, payoutCents: 4240 },
  ];
}

// ─── Helpers ────────────────────────────────────────────

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatCentsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

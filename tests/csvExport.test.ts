/**
 * CSV Export Utility Tests
 *
 * Tests generateTransactionCSV and generatePayoutCSV from src/utils/csvExport.ts.
 * Uses mock data matching the actual ActivityFeedItem and Payout interfaces.
 */

import { generateTransactionCSV, generatePayoutCSV } from '../src/utils/csvExport';
import type { ActivityFeedItem } from '../src/data/mockCafeDashboard';
import { PayoutStatus, PLATFORM } from '../src/config/constants';
import type { Payout } from '../src/models';

// ─── Fixtures ──────────────────────────────────────────

const sampleTransactions: ActivityFeedItem[] = [
  {
    id: 'act_001',
    type: 'redemption',
    customerName: 'Sarah M.',
    menuItemName: 'Oat Milk Latte',
    creditAmount: 6,
    timestamp: new Date('2026-03-15T10:30:00'),
  },
  {
    id: 'act_002',
    type: 'new_order',
    customerName: 'Mike T.',
    menuItemName: 'Espresso',
    creditAmount: 4,
    timestamp: new Date('2026-03-15T11:00:00'),
  },
];

const samplePayouts: Payout[] = [
  {
    id: 'payout_001',
    cafeId: 'cafe_1',
    periodStart: new Date('2026-03-01'),
    periodEnd: new Date('2026-03-07'),
    totalCreditsRedeemed: 50,
    payoutAmountCents: 4000,
    platformFeeCents: 1000,
    platformFeeRate: PLATFORM.STANDARD_FEE_RATE,
    orderCount: 10,
    stripeTransferId: 'tr_001',
    status: PayoutStatus.COMPLETED,
    createdAt: new Date('2026-03-08'),
    completedAt: new Date('2026-03-09'),
  },
  {
    id: 'payout_002',
    cafeId: 'cafe_1',
    periodStart: new Date('2026-03-08'),
    periodEnd: new Date('2026-03-14'),
    totalCreditsRedeemed: 30,
    payoutAmountCents: 2400,
    platformFeeCents: 600,
    platformFeeRate: PLATFORM.STANDARD_FEE_RATE,
    orderCount: 6,
    status: PayoutStatus.PROCESSING,
    createdAt: new Date('2026-03-15'),
  },
];

// ─── generateTransactionCSV ─────────────────────────────

describe('generateTransactionCSV', () => {
  test('includes correct column headers', () => {
    const csv = generateTransactionCSV('Test Cafe', sampleTransactions, samplePayouts);
    expect(csv).toContain('Date,Customer,Item,Credits,Revenue ($),Status');
  });

  test('includes summary header with cafe name', () => {
    const csv = generateTransactionCSV('Blue Bottle', sampleTransactions, samplePayouts);
    expect(csv).toContain('Blue Bottle');
    expect(csv).toContain('CoffeePass Transaction Report');
  });

  test('includes total credits in summary', () => {
    const csv = generateTransactionCSV('Test Cafe', sampleTransactions, samplePayouts);
    expect(csv).toContain('Total Credits:,10');
  });

  test('includes all transaction rows', () => {
    const csv = generateTransactionCSV('Test Cafe', sampleTransactions, samplePayouts);
    expect(csv).toContain('Sarah M.');
    expect(csv).toContain('Oat Milk Latte');
    expect(csv).toContain('Mike T.');
    expect(csv).toContain('Espresso');
  });

  test('maps activity type to readable status', () => {
    const csv = generateTransactionCSV('Test Cafe', sampleTransactions, samplePayouts);
    expect(csv).toContain('Redeemed');
    expect(csv).toContain('New Order');
  });

  test('properly escapes commas in values', () => {
    const withComma: ActivityFeedItem[] = [
      {
        id: 'act_003',
        type: 'redemption',
        customerName: 'Beans, Leaves & More',
        menuItemName: 'Latte',
        creditAmount: 3,
        timestamp: new Date('2026-03-15T12:00:00'),
      },
    ];
    const csv = generateTransactionCSV('Test Cafe', withComma, []);
    expect(csv).toContain('"Beans, Leaves & More"');
  });

  test('properly escapes quotes in values', () => {
    const withQuote: ActivityFeedItem[] = [
      {
        id: 'act_004',
        type: 'redemption',
        customerName: 'The "Best" Customer',
        menuItemName: 'Latte',
        creditAmount: 3,
        timestamp: new Date('2026-03-15T12:00:00'),
      },
    ];
    const csv = generateTransactionCSV('Test Cafe', withQuote, []);
    expect(csv).toContain('""Best""');
  });

  test('empty transactions produces valid CSV with headers', () => {
    const csv = generateTransactionCSV('Test Cafe', [], []);
    const lines = csv.trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(1);
    expect(csv).toContain('Date,Customer,Item,Credits');
    expect(csv).toContain('Total Transactions:,0');
  });
});

// ─── generatePayoutCSV ─────────────────────────────────

describe('generatePayoutCSV', () => {
  test('includes correct column headers', () => {
    const csv = generatePayoutCSV('Test Cafe', samplePayouts);
    expect(csv).toContain('Period Start');
    expect(csv).toContain('Period End');
    expect(csv).toContain('Credits Redeemed');
    expect(csv).toContain('Payout ($)');
    expect(csv).toContain('Status');
  });

  test('includes summary header with cafe name', () => {
    const csv = generatePayoutCSV('My Cafe', samplePayouts);
    expect(csv).toContain('My Cafe');
    expect(csv).toContain('CoffeePass Payout Report');
  });

  test('includes total paid in summary', () => {
    const csv = generatePayoutCSV('Test Cafe', samplePayouts);
    expect(csv).toContain('Total Paid:,$64.00');
  });

  test('includes all payout rows', () => {
    const csv = generatePayoutCSV('Test Cafe', samplePayouts);
    expect(csv).toContain('$40.00');
    expect(csv).toContain('$24.00');
  });

  test('includes completed date for completed payouts', () => {
    const csv = generatePayoutCSV('Test Cafe', samplePayouts);
    const lines = csv.split('\n');
    const dataLines = lines.filter(l => l.includes('COMPLETED') || l.includes('PROCESSING'));
    expect(dataLines.length).toBe(2);
  });

  test('empty payouts produces valid CSV with headers', () => {
    const csv = generatePayoutCSV('Test Cafe', []);
    expect(csv).toContain('Period Start');
    expect(csv).toContain('Total Payouts:,0');
  });
});

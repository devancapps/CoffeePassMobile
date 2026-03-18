/**
 * CSV Export Utilities
 *
 * Generates CSV strings for cafe owner transaction and payout reports.
 * Uses the Share API to allow exporting to email, files, etc.
 */

import type { ActivityFeedItem } from '@/data/mockCafeDashboard';
import { formatCentsToDollars } from '@/data/mockCafeDashboard';
import type { Payout } from '@/models';

// ─── Helpers ────────────────────────────────────────────

/** Escape a CSV field: wrap in quotes if it contains commas, quotes, or newlines */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Format a date for CSV display: "2026-03-18 14:30" */
function formatCSVDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

/** Map activity type to a human-readable status label */
function activityTypeToStatus(type: ActivityFeedItem['type']): string {
  switch (type) {
    case 'redemption':
      return 'Redeemed';
    case 'new_order':
      return 'New Order';
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    default:
      return type;
  }
}

/** Estimate revenue in cents from credit amount (credits * $1.00 each) */
function creditsToRevenueCents(credits: number): number {
  return credits * 100;
}

// ─── Transaction CSV ────────────────────────────────────

/**
 * Generate a CSV string from transaction activity feed data.
 *
 * Includes a summary header with cafe name, export date, and totals,
 * followed by individual transaction rows.
 */
export function generateTransactionCSV(
  cafeName: string,
  transactions: ActivityFeedItem[],
  payouts: Payout[],
): string {
  const rows: string[] = [];
  const exportDate = new Date().toISOString().split('T')[0];

  // Calculate totals
  const totalCredits = transactions.reduce((sum, t) => sum + t.creditAmount, 0);
  const totalRevenueCents = transactions.reduce(
    (sum, t) => sum + creditsToRevenueCents(t.creditAmount),
    0,
  );
  const totalPayoutCents = payouts.reduce((sum, p) => sum + p.payoutAmountCents, 0);

  // Summary header rows
  rows.push(`CoffeePass Transaction Report`);
  rows.push(`Cafe:,${escapeCSVField(cafeName)}`);
  rows.push(`Exported:,${exportDate}`);
  rows.push(`Total Transactions:,${transactions.length}`);
  rows.push(`Total Credits:,${totalCredits}`);
  rows.push(`Total Revenue:,${formatCentsToDollars(totalRevenueCents)}`);
  rows.push(`Total Payouts:,${formatCentsToDollars(totalPayoutCents)}`);
  rows.push(''); // blank separator

  // Column headers
  rows.push('Date,Customer,Item,Credits,Revenue ($),Status');

  // Data rows
  for (const txn of transactions) {
    const date = escapeCSVField(formatCSVDate(txn.timestamp));
    const customer = escapeCSVField(txn.customerName);
    const item = escapeCSVField(txn.menuItemName);
    const credits = String(txn.creditAmount);
    const revenue = formatCentsToDollars(creditsToRevenueCents(txn.creditAmount));
    const status = activityTypeToStatus(txn.type);

    rows.push(`${date},${customer},${item},${credits},${revenue},${status}`);
  }

  return rows.join('\n');
}

// ─── Payout CSV ─────────────────────────────────────────

/**
 * Generate a CSV string from payout history data.
 *
 * Includes a summary header with cafe name, export date, and totals,
 * followed by individual payout rows.
 */
export function generatePayoutCSV(
  cafeName: string,
  payouts: Payout[],
): string {
  const rows: string[] = [];
  const exportDate = new Date().toISOString().split('T')[0];

  // Calculate totals
  const totalPayoutCents = payouts.reduce((sum, p) => sum + p.payoutAmountCents, 0);
  const totalFeesCents = payouts.reduce((sum, p) => sum + p.platformFeeCents, 0);
  const totalCredits = payouts.reduce((sum, p) => sum + p.totalCreditsRedeemed, 0);
  const totalOrders = payouts.reduce((sum, p) => sum + p.orderCount, 0);

  // Summary header rows
  rows.push(`CoffeePass Payout Report`);
  rows.push(`Cafe:,${escapeCSVField(cafeName)}`);
  rows.push(`Exported:,${exportDate}`);
  rows.push(`Total Payouts:,${payouts.length}`);
  rows.push(`Total Paid:,${formatCentsToDollars(totalPayoutCents)}`);
  rows.push(`Total Platform Fees:,${formatCentsToDollars(totalFeesCents)}`);
  rows.push(`Total Credits Redeemed:,${totalCredits}`);
  rows.push(`Total Orders:,${totalOrders}`);
  rows.push(''); // blank separator

  // Column headers
  rows.push('Period Start,Period End,Credits Redeemed,Orders,Payout ($),Platform Fee ($),Fee Rate (%),Status,Completed Date');

  // Data rows
  for (const payout of payouts) {
    const periodStart = escapeCSVField(formatCSVDate(payout.periodStart));
    const periodEnd = escapeCSVField(formatCSVDate(payout.periodEnd));
    const credits = String(payout.totalCreditsRedeemed);
    const orders = String(payout.orderCount);
    const amount = formatCentsToDollars(payout.payoutAmountCents);
    const fee = formatCentsToDollars(payout.platformFeeCents);
    const feeRate = (payout.platformFeeRate * 100).toFixed(0);
    const status = payout.status;
    const completedDate = payout.completedAt
      ? escapeCSVField(formatCSVDate(payout.completedAt))
      : '';

    rows.push(`${periodStart},${periodEnd},${credits},${orders},${amount},${fee},${feeRate},${status},${completedDate}`);
  }

  return rows.join('\n');
}

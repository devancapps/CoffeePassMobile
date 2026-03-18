/**
 * CoffeePass Cloud Functions
 *
 * Entry point for all Firebase Cloud Functions.
 * Each function is imported from its own module for clarity.
 */

import * as admin from 'firebase-admin';

admin.initializeApp();

// ─── Auth Triggers ───────────────────────────────────────
export { onUserCreate } from './auth/onUserCreate';

// ─── Stripe / Payout Functions ───────────────────────────
export { createStripeConnectAccount } from './stripe/createStripeConnectAccount';
export { handleStripeWebhook } from './stripe/handleStripeWebhook';

// ─── Credit Purchase Functions ───────────────────────────
export { purchaseCredits } from './credits/purchaseCredits';

// ─── Redemption Functions ────────────────────────────────
export { createRedemptionToken } from './redemption/createRedemptionToken';
export { redeemToken } from './redemption/redeemToken';

// ─── Scheduled Functions ─────────────────────────────────
export { processWeeklyPayouts } from './payouts/processWeeklyPayouts';
export { expireStaleTokens } from './redemption/expireStaleTokens';
export { expireCredits } from './credits/expireCredits';
export { reconcileCredits } from './credits/reconcileCredits';
export { expireFounderRates } from './payouts/expireFounderRates';

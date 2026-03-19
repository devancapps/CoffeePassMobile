/**
 * Stripe Configuration
 *
 * USE_STRIPE_PAYMENTS mirrors the USE_FIREBASE_AUTH pattern:
 *  false → mock payment flow (no Stripe SDK calls, no network)
 *  true  → real Stripe Payment Sheet + Cloud Function round-trip
 *
 * Switch to true when you have a real Stripe publishable key configured
 * and are running an EAS/custom dev-client build (Stripe SDK requires
 * native modules and does not work in Expo Go).
 *
 * PRD Section 8.1: Credit purchase flow
 */

// ─── Mode Toggle ─────────────────────────────────────────

/**
 * Set to true to enable real Stripe payments.
 * Requires EAS build with native modules (not compatible with Expo Go).
 */
export const USE_STRIPE_PAYMENTS = false;

// ─── Keys ─────────────────────────────────────────────────

/**
 * Stripe publishable key (test mode).
 * Replace with your live key before App Store submission.
 *
 * Test key format: pk_test_...
 * Live key format: pk_live_...
 */
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51PLACEHOLDER_replace_with_your_actual_stripe_test_key';

/**
 * Apple Pay merchant identifier — must match app.json.
 */
export const MERCHANT_IDENTIFIER = 'merchant.com.coffeepass.mobile';

// ─── Cloud Function Names ─────────────────────────────────

/** Callable function: creates Stripe PaymentIntent, returns clientSecret */
export const CF_PURCHASE_CREDITS = 'purchaseCredits';

/** Callable function: creates Stripe Connect account, returns onboardingUrl */
export const CF_CREATE_STRIPE_CONNECT = 'createStripeConnectAccount';

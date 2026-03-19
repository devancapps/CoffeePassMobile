/**
 * Stripe Payments Service (client-side)
 *
 * Wraps calls to Firebase Cloud Functions that interact with Stripe.
 * All monetary logic (credit fulfillment, payout) runs server-side via
 * Cloud Functions + Stripe webhooks — this layer only initiates the flow.
 *
 * Used only when USE_STRIPE_PAYMENTS = true.
 * PRD Section 8.1 / 8.2: Credit purchase + payout flows
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { CF_PURCHASE_CREDITS, CF_CREATE_STRIPE_CONNECT } from '@/config/stripe';

// ─── Types ────────────────────────────────────────────────

export interface PurchaseCreditsRequest {
  bundleId: string;
}

export interface PurchaseCreditsResponse {
  /** Stripe PaymentIntent client secret — passed to presentPaymentSheet */
  clientSecret: string;
  /** Firestore purchase record ID */
  purchaseId: string;
}

export interface CreateConnectAccountRequest {
  cafeId: string;
  email: string;
  businessName: string;
}

export interface CreateConnectAccountResponse {
  /** Stripe Connect account ID */
  accountId: string;
  /** Stripe-hosted onboarding URL — open with Linking.openURL */
  onboardingUrl: string;
}

// ─── Functions ────────────────────────────────────────────

/**
 * Call the `purchaseCredits` Cloud Function to create a Stripe PaymentIntent.
 * Returns the clientSecret needed to present the Stripe Payment Sheet.
 *
 * Credit fulfillment happens via the `payment_intent.succeeded` webhook
 * (handleStripeWebhook Cloud Function) — not in this call.
 */
export async function callPurchaseCredits(
  bundleId: string,
): Promise<PurchaseCreditsResponse> {
  const functions = getFunctions();
  const fn = httpsCallable<PurchaseCreditsRequest, PurchaseCreditsResponse>(
    functions,
    CF_PURCHASE_CREDITS,
  );
  const result = await fn({ bundleId });
  return result.data;
}

/**
 * Call the `createStripeConnectAccount` Cloud Function to create a
 * Stripe Express account for a cafe owner and get the onboarding URL.
 *
 * The caller should open `onboardingUrl` with `Linking.openURL` so the
 * cafe owner can complete Stripe's bank-account onboarding in Safari.
 */
export async function callCreateStripeConnectAccount(
  cafeId: string,
  email: string,
  businessName: string,
): Promise<CreateConnectAccountResponse> {
  const functions = getFunctions();
  const fn = httpsCallable<CreateConnectAccountRequest, CreateConnectAccountResponse>(
    functions,
    CF_CREATE_STRIPE_CONNECT,
  );
  const result = await fn({ cafeId, email, businessName });
  return result.data;
}

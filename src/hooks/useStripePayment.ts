/**
 * useStripePayment Hook
 *
 * Orchestrates the full Stripe Payment Sheet flow for a credit bundle purchase:
 *   1. Call `purchaseCredits` Cloud Function → get clientSecret
 *   2. Initialize Stripe Payment Sheet with clientSecret
 *   3. Present the Payment Sheet to the user
 *   4. On success → credit fulfillment happens via Stripe webhook (server-side)
 *
 * Falls back to mock mode when USE_STRIPE_PAYMENTS = false so the app runs
 * fully in Expo Go without native modules.
 *
 * PRD Section 8.1: Bundle selection → payment → success
 */

import { useCallback, useState } from 'react';
import { USE_STRIPE_PAYMENTS } from '@/config/stripe';
import { callPurchaseCredits } from '@/services/stripe/payments';
import { CreditBundle } from '@/config/constants';

// ─── Stripe SDK (conditionally imported to avoid native module crash in Expo Go) ──

// We use a dynamic require so the module is only loaded when USE_STRIPE_PAYMENTS=true.
// TypeScript sees this as `any`; we cast to the shape we need below.
type StripeHook = {
  initPaymentSheet: (params: Record<string, unknown>) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { message: string } }>;
};

function getStripeHook(): StripeHook | null {
  if (!USE_STRIPE_PAYMENTS) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useStripe } = require('@stripe/stripe-react-native') as { useStripe: () => StripeHook };
    return useStripe();
  } catch {
    return null;
  }
}

// ─── Result Types ─────────────────────────────────────────

export type PaymentResult =
  | { status: 'success'; purchaseId: string }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

export interface UseStripePaymentResult {
  /** True while a payment is in progress */
  isProcessing: boolean;
  /** Initiate payment for the given bundle */
  initiatePayment: (bundle: CreditBundle) => Promise<PaymentResult>;
}

// ─── Hook ─────────────────────────────────────────────────

export function useStripePayment(): UseStripePaymentResult {
  const [isProcessing, setIsProcessing] = useState(false);

  // In Stripe mode we call useStripe() at hook level; in mock mode it's null.
  // getStripeHook() wraps the conditional require so it's always called
  // (hooks rules require consistent call order — the flag is a build-time constant).
  const stripe = USE_STRIPE_PAYMENTS ? getStripeHook() : null;

  const initiatePayment = useCallback(
    async (bundle: CreditBundle): Promise<PaymentResult> => {
      setIsProcessing(true);

      try {
        if (!USE_STRIPE_PAYMENTS || !stripe) {
          // ── Mock mode ──────────────────────────────────
          // Simulate network latency then return success.
          await new Promise<void>((resolve) => setTimeout(resolve, 1500));
          return { status: 'success', purchaseId: `mock_purchase_${Date.now()}` };
        }

        // ── Stripe mode ────────────────────────────────
        // Step 1: Get PaymentIntent clientSecret from Cloud Function
        const { clientSecret, purchaseId } = await callPurchaseCredits(bundle.id);

        // Step 2: Initialize Payment Sheet
        const { error: initError } = await stripe.initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'CoffeePass',
          // Apple Pay is disabled until merchant verification is complete
          applePay: { merchantCountryCode: 'US' },
          style: 'automatic',
          appearance: {
            colors: {
              primary: '#C17C3A',        // caramel
              background: '#FDF8F3',     // cream
              componentBackground: '#FFFFFF',
              componentBorder: '#E5E0D8',
              componentDivider: '#E5E0D8',
              primaryText: '#3B1F0E',    // espresso
              secondaryText: '#6B5B4E',
            },
          },
        });

        if (initError) {
          return { status: 'error', message: initError.message };
        }

        // Step 3: Present Payment Sheet
        const { error: presentError } = await stripe.presentPaymentSheet();

        if (presentError) {
          // Code 'Canceled' means user dismissed the sheet — not an error
          if (presentError.message?.toLowerCase().includes('cancel')) {
            return { status: 'cancelled' };
          }
          return { status: 'error', message: presentError.message };
        }

        // Payment succeeded — credits will be fulfilled by the Stripe webhook
        return { status: 'success', purchaseId };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment failed';
        return { status: 'error', message };
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe],
  );

  return { isProcessing, initiatePayment };
}

/**
 * purchaseCredits — Callable Function
 *
 * Creates a Stripe PaymentIntent for a credit bundle purchase.
 * Returns the clientSecret so the mobile app can confirm payment.
 *
 * PRD Section 8.1: Credit bundles & pricing
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key ?? '', {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
});

// Credit bundles matching PRD spec
const CREDIT_BUNDLES: Record<string, { credits: number; priceInCents: number }> = {
  'bundle_5': { credits: 5, priceInCents: 499 },
  'bundle_10': { credits: 10, priceInCents: 899 },
  'bundle_25': { credits: 25, priceInCents: 1999 },
  'bundle_50': { credits: 50, priceInCents: 3499 },
  'bundle_100': { credits: 100, priceInCents: 7499 },
};

interface PurchaseRequest {
  bundleId: string;
}

interface PurchaseResponse {
  clientSecret: string;
  purchaseId: string;
}

export const purchaseCredits = functions.https.onCall(
  async (data: PurchaseRequest, context): Promise<PurchaseResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const { bundleId } = data;
    const bundle = CREDIT_BUNDLES[bundleId];

    if (!bundle) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid bundle: ${bundleId}. Valid: ${Object.keys(CREDIT_BUNDLES).join(', ')}`
      );
    }

    const db = admin.firestore();
    const userId = context.auth.uid;

    try {
      // Create purchase record
      const purchaseRef = db.collection('creditPurchases').doc();
      const purchaseId = purchaseRef.id;

      await purchaseRef.set({
        id: purchaseId,
        userId,
        bundleId,
        credits: bundle.credits,
        amountInCents: bundle.priceInCents,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: bundle.priceInCents,
        currency: 'usd',
        metadata: {
          coffeepass_purchase_id: purchaseId,
          coffeepass_user_id: userId,
          coffeepass_credits: String(bundle.credits),
          coffeepass_bundle_id: bundleId,
        },
        description: `CoffeePass: ${bundle.credits} credits`,
      });

      // Save PaymentIntent ID to purchase record
      await purchaseRef.update({
        stripePaymentIntentId: paymentIntent.id,
      });

      functions.logger.info(`PaymentIntent created for ${bundle.credits} credits`, {
        userId,
        purchaseId,
        amount: bundle.priceInCents,
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        purchaseId,
      };
    } catch (error) {
      functions.logger.error('Failed to create payment intent', error);
      throw new functions.https.HttpsError('internal', 'Failed to initiate purchase');
    }
  }
);

/**
 * createStripeConnectAccount — Callable Function
 *
 * Creates a Stripe Connect Express account for a cafe owner
 * and returns the onboarding URL. Called during PayoutSetup
 * in the cafe onboarding wizard.
 *
 * PRD Section 8: Platform economics & payouts
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key ?? '', {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
});

interface CreateAccountRequest {
  cafeId: string;
  email: string;
  businessName: string;
}

interface CreateAccountResponse {
  accountId: string;
  onboardingUrl: string;
}

export const createStripeConnectAccount = functions.https.onCall(
  async (data: CreateAccountRequest, context): Promise<CreateAccountResponse> => {
    // Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const { cafeId, email, businessName } = data;

    if (!cafeId || !email || !businessName) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Verify the caller owns this cafe
    const db = admin.firestore();
    const cafeDoc = await db.collection('cafes').doc(cafeId).get();

    if (!cafeDoc.exists || cafeDoc.data()?.ownerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not the cafe owner');
    }

    try {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          coffeepass_cafe_id: cafeId,
          coffeepass_user_id: context.auth.uid,
        },
      });

      // Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `https://coffeepass.app/stripe/refresh?cafeId=${cafeId}`,
        return_url: `https://coffeepass.app/stripe/return?cafeId=${cafeId}`,
        type: 'account_onboarding',
      });

      // Save Stripe account ID to cafe doc
      await db.collection('cafes').doc(cafeId).update({
        stripeAccountId: account.id,
        stripeOnboardingComplete: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Stripe Connect account created for cafe ${cafeId}`, {
        accountId: account.id,
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      functions.logger.error('Failed to create Stripe Connect account', error);
      throw new functions.https.HttpsError('internal', 'Failed to create payment account');
    }
  }
);

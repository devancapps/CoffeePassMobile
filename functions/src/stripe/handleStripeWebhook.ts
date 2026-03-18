/**
 * handleStripeWebhook — HTTP Function
 *
 * Receives Stripe webhook events for:
 * - payment_intent.succeeded → credit purchase fulfillment
 * - account.updated → Connect onboarding status
 * - payout.paid / payout.failed → payout tracking
 *
 * PRD Section 8: Monetary logic
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key ?? '', {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
});

const endpointSecret = functions.config().stripe?.webhook_secret ?? '';

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    functions.logger.error('Webhook signature verification failed', err);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  const db = admin.firestore();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const purchaseId = paymentIntent.metadata.coffeepass_purchase_id;
        const userId = paymentIntent.metadata.coffeepass_user_id;
        const credits = parseInt(paymentIntent.metadata.coffeepass_credits ?? '0', 10);

        if (purchaseId && userId && credits > 0) {
          await db.runTransaction(async (txn) => {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await txn.get(userRef);

            if (!userDoc.exists) {
              throw new Error(`User ${userId} not found`);
            }

            const currentBalance = userDoc.data()?.creditBalance ?? 0;

            // Update user balance
            txn.update(userRef, {
              creditBalance: currentBalance + credits,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Update purchase status
            txn.update(db.collection('creditPurchases').doc(purchaseId), {
              status: 'completed',
              completedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Create ledger entry
            txn.set(db.collection('creditLedger').doc(), {
              userId,
              type: 'purchase',
              amount: credits,
              balanceAfter: currentBalance + credits,
              referenceId: purchaseId,
              description: `Purchased ${credits} credits`,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          });

          functions.logger.info(`Credits fulfilled: ${credits} for user ${userId}`);
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        const cafeId = account.metadata?.coffeepass_cafe_id;

        if (cafeId && account.charges_enabled) {
          await db.collection('cafes').doc(cafeId).update({
            stripeOnboardingComplete: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          functions.logger.info(`Stripe onboarding complete for cafe ${cafeId}`);
        }
        break;
      }

      default:
        functions.logger.info(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    functions.logger.error(`Error processing webhook event ${event.type}`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

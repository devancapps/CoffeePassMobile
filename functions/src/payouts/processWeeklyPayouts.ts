/**
 * processWeeklyPayouts — Scheduled Function
 *
 * Runs every Monday at 6:00 AM UTC. Aggregates each cafe's pending
 * earnings from the past week and initiates a Stripe transfer to
 * their Connect account.
 *
 * PRD Section 8.3: Weekly payouts to cafes
 * - Founder rate: 88¢ per credit (12% platform fee)
 * - Standard rate: 80¢ per credit (20% platform fee)
 * - Minimum payout: $5.00
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe?.secret_key ?? '', {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
});

const MINIMUM_PAYOUT_CENTS = 500; // $5.00

export const processWeeklyPayouts = functions.pubsub
  .schedule('every monday 06:00')
  .timeZone('America/New_York')
  .onRun(async () => {
    const db = admin.firestore();

    // Get all pending earnings grouped by cafe
    const pendingEarnings = await db
      .collection('cafeEarnings')
      .where('status', '==', 'pending_payout')
      .get();

    if (pendingEarnings.empty) {
      functions.logger.info('No pending earnings to process');
      return;
    }

    // Group earnings by cafeId
    const cafeEarnings = new Map<string, {
      totalAmount: number;
      totalCredits: number;
      earningIds: string[];
    }>();

    for (const doc of pendingEarnings.docs) {
      const earning = doc.data();
      const existing = cafeEarnings.get(earning.cafeId) ?? {
        totalAmount: 0,
        totalCredits: 0,
        earningIds: [],
      };

      existing.totalAmount += earning.payoutAmount;
      existing.totalCredits += earning.creditsRedeemed;
      existing.earningIds.push(doc.id);
      cafeEarnings.set(earning.cafeId, existing);
    }

    functions.logger.info(`Processing payouts for ${cafeEarnings.size} cafes`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const [cafeId, earnings] of cafeEarnings) {
      const payoutAmountCents = Math.round(earnings.totalAmount * 100);

      // Skip if below minimum
      if (payoutAmountCents < MINIMUM_PAYOUT_CENTS) {
        functions.logger.info(
          `Skipping cafe ${cafeId}: $${(payoutAmountCents / 100).toFixed(2)} below $5.00 minimum`
        );
        skipCount++;
        continue;
      }

      // Get cafe's Stripe account
      const cafeDoc = await db.collection('cafes').doc(cafeId).get();
      const cafe = cafeDoc.data();

      if (!cafe?.stripeAccountId || !cafe?.stripeOnboardingComplete) {
        functions.logger.warn(`Cafe ${cafeId} has no valid Stripe account, skipping`);
        skipCount++;
        continue;
      }

      try {
        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: payoutAmountCents,
          currency: 'usd',
          destination: cafe.stripeAccountId,
          metadata: {
            coffeepass_cafe_id: cafeId,
            coffeepass_credits: String(earnings.totalCredits),
            coffeepass_period: new Date().toISOString().split('T')[0],
          },
          description: `CoffeePass weekly payout: ${earnings.totalCredits} credits`,
        });

        // Create payout record
        const payoutRef = db.collection('payouts').doc();
        await payoutRef.set({
          id: payoutRef.id,
          cafeId,
          stripeTransferId: transfer.id,
          amountInCents: payoutAmountCents,
          creditsRedeemed: earnings.totalCredits,
          earningIds: earnings.earningIds,
          status: 'completed',
          periodEnd: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Mark earnings as paid
        const batch = db.batch();
        for (const earningId of earnings.earningIds) {
          batch.update(db.collection('cafeEarnings').doc(earningId), {
            status: 'paid',
            payoutId: payoutRef.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        await batch.commit();

        successCount++;
        functions.logger.info(
          `Payout processed for cafe ${cafeId}: $${(payoutAmountCents / 100).toFixed(2)}`
        );
      } catch (error) {
        errorCount++;
        functions.logger.error(`Failed payout for cafe ${cafeId}`, error);

        // Record failed payout
        await db.collection('payouts').doc().set({
          cafeId,
          amountInCents: payoutAmountCents,
          creditsRedeemed: earnings.totalCredits,
          earningIds: earnings.earningIds,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    functions.logger.info(
      `Weekly payouts complete: ${successCount} success, ${skipCount} skipped, ${errorCount} errors`
    );
  });

/**
 * expireStaleTokens — Scheduled Function
 *
 * Runs every 5 minutes to find active redemption tokens past their
 * 15-minute TTL. Marks them expired and refunds credits to users.
 *
 * PRD Section 8.4: "Tokens auto-expire after 15 minutes"
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const expireStaleTokens = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Find active tokens that have expired
    const staleTokens = await db
      .collection('redemptionTokens')
      .where('status', '==', 'active')
      .where('expiresAt', '<=', now)
      .limit(100) // Process in batches
      .get();

    if (staleTokens.empty) {
      functions.logger.info('No stale tokens to expire');
      return;
    }

    functions.logger.info(`Expiring ${staleTokens.size} stale tokens`);

    let expiredCount = 0;
    let errorCount = 0;

    for (const tokenDoc of staleTokens.docs) {
      const token = tokenDoc.data();

      try {
        await db.runTransaction(async (txn) => {
          // Mark token as expired
          txn.update(tokenDoc.ref, {
            status: 'expired',
            expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update order back to created (so user can try again)
          txn.update(db.collection('orders').doc(token.orderId), {
            status: 'created',
            redemptionTokenId: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Refund credits to user
          const userRef = db.collection('users').doc(token.userId);
          const userDoc = await txn.get(userRef);
          const currentBalance = userDoc.data()?.creditBalance ?? 0;

          txn.update(userRef, {
            creditBalance: currentBalance + token.creditsHeld,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Create refund ledger entry
          txn.set(db.collection('creditLedger').doc(), {
            userId: token.userId,
            type: 'redemption_refund',
            amount: token.creditsHeld,
            balanceAfter: currentBalance + token.creditsHeld,
            referenceId: token.orderId,
            description: `Refunded ${token.creditsHeld} credits (token expired)`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        expiredCount++;
      } catch (error) {
        functions.logger.error(`Failed to expire token ${tokenDoc.id}`, error);
        errorCount++;
      }
    }

    functions.logger.info(`Expired ${expiredCount} tokens, ${errorCount} errors`);
  });

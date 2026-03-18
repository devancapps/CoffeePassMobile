/**
 * expireCredits — Scheduled Function
 *
 * Runs daily at 2:00 AM UTC to expire credits older than 12 months.
 * For each expired purchase, debits the user's balance, creates a
 * ledger entry with type CREDIT_EXPIRY, and marks the purchase expired.
 *
 * PRD Section 8.2: "Credits expire 12 months after purchase"
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const expireCredits = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Query credit purchases that have reached their expiry date
    const expiredPurchases = await db
      .collection('creditPurchases')
      .where('expiresAt', '<=', now)
      .where('status', '==', 'completed')
      .limit(200) // Process in batches to stay within function limits
      .get();

    if (expiredPurchases.empty) {
      functions.logger.info('No expired credit purchases to process');
      return;
    }

    functions.logger.info(`Processing ${expiredPurchases.size} expired credit purchases`);

    let expiredCount = 0;
    let errorCount = 0;

    for (const purchaseDoc of expiredPurchases.docs) {
      const purchase = purchaseDoc.data();

      try {
        await db.runTransaction(async (txn) => {
          // Read user's current balance
          const userRef = db.collection('users').doc(purchase.userId);
          const userDoc = await txn.get(userRef);

          if (!userDoc.exists) {
            functions.logger.warn(
              `User ${purchase.userId} not found for purchase ${purchaseDoc.id}, skipping`
            );
            return;
          }

          const currentBalance = userDoc.data()?.creditBalance ?? 0;
          const creditsToExpire = purchase.creditsIssued;

          // Debit cannot exceed current balance
          const debitAmount = Math.min(creditsToExpire, currentBalance);
          const newBalance = currentBalance - debitAmount;

          // Update user balance
          txn.update(userRef, {
            creditBalance: newBalance,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Create ledger entry for the expiry
          const ledgerRef = db.collection('creditLedger').doc();
          txn.set(ledgerRef, {
            id: ledgerRef.id,
            userId: purchase.userId,
            type: 'CREDIT_EXPIRY',
            amount: -debitAmount,
            balanceAfter: newBalance,
            referenceId: purchaseDoc.id,
            description: `Expired ${debitAmount} credits from purchase ${purchaseDoc.id} (12-month expiry)`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Mark the purchase as expired
          txn.update(purchaseDoc.ref, {
            status: 'expired',
            expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        expiredCount++;
      } catch (error) {
        errorCount++;
        functions.logger.error(
          `Failed to expire purchase ${purchaseDoc.id} for user ${purchase.userId}`,
          error
        );
      }
    }

    functions.logger.info(
      `Credit expiry complete: ${expiredCount} expired, ${errorCount} errors`
    );
  });

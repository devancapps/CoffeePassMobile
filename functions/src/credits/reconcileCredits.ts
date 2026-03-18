/**
 * reconcileCredits — Scheduled Function
 *
 * Runs nightly at 3:00 AM UTC. For each user, sums all credit ledger
 * entries and compares the result to the stored creditBalance.
 * Logs warnings for any mismatches and creates a reconciliation report.
 *
 * PRD Section 8.2: Credit balance integrity
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const reconcileCredits = functions.pubsub
  .schedule('every day 03:00')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore();

    // Get all users with a creditBalance > 0 (or who have ever had credits)
    const usersSnapshot = await db
      .collection('users')
      .where('creditBalance', '>=', 0)
      .get();

    if (usersSnapshot.empty) {
      functions.logger.info('No users to reconcile');
      return;
    }

    functions.logger.info(`Reconciling credit balances for ${usersSnapshot.size} users`);

    let matchCount = 0;
    let mismatchCount = 0;
    const mismatches: Array<{
      userId: string;
      storedBalance: number;
      computedBalance: number;
      difference: number;
    }> = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const storedBalance: number = userData.creditBalance ?? 0;

      // Sum all ledger entries for this user
      const ledgerSnapshot = await db
        .collection('creditLedger')
        .where('userId', '==', userDoc.id)
        .get();

      let computedBalance = 0;
      for (const ledgerDoc of ledgerSnapshot.docs) {
        computedBalance += ledgerDoc.data().amount ?? 0;
      }

      // Compare
      if (Math.abs(storedBalance - computedBalance) > 0.001) {
        mismatchCount++;
        const difference = storedBalance - computedBalance;

        mismatches.push({
          userId: userDoc.id,
          storedBalance,
          computedBalance,
          difference,
        });

        functions.logger.warn(
          `Credit balance mismatch for user ${userDoc.id}: ` +
          `stored=${storedBalance}, computed=${computedBalance}, diff=${difference}`
        );
      } else {
        matchCount++;
      }
    }

    // Create reconciliation report
    const reportRef = db.collection('reconciliation_reports').doc();
    await reportRef.set({
      id: reportRef.id,
      runAt: admin.firestore.FieldValue.serverTimestamp(),
      totalUsersChecked: usersSnapshot.size,
      matchCount,
      mismatchCount,
      mismatches: mismatches.slice(0, 100), // Cap stored mismatches to avoid oversized documents
      status: mismatchCount === 0 ? 'clean' : 'mismatches_found',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(
      `Reconciliation complete: ${matchCount} matched, ${mismatchCount} mismatches out of ${usersSnapshot.size} users. Report: ${reportRef.id}`
    );
  });

/**
 * expireFounderRates — Scheduled Function
 *
 * Runs daily at 4:00 AM UTC. Finds cafes whose founder-rate discount
 * period has ended and updates them to the standard 20% platform fee.
 *
 * PRD Section 8.3: "Founder rate (12%) expires after promotional period"
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const STANDARD_FEE_RATE = 0.20;

export const expireFounderRates = functions.pubsub
  .schedule('every day 04:00')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Find cafes with an expired founder rate that haven't been updated yet
    const expiredFounderCafes = await db
      .collection('cafes')
      .where('founderRateExpiresAt', '<=', now)
      .where('platformFeeRate', '<', STANDARD_FEE_RATE)
      .get();

    if (expiredFounderCafes.empty) {
      functions.logger.info('No founder rates to expire');
      return;
    }

    functions.logger.info(
      `Expiring founder rates for ${expiredFounderCafes.size} cafes`
    );

    let updatedCount = 0;
    let errorCount = 0;

    for (const cafeDoc of expiredFounderCafes.docs) {
      try {
        await cafeDoc.ref.update({
          platformFeeRate: STANDARD_FEE_RATE,
          founderRateExpiresAt: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        updatedCount++;
        functions.logger.info(
          `Updated cafe ${cafeDoc.id} from ${cafeDoc.data().platformFeeRate * 100}% to ${STANDARD_FEE_RATE * 100}% platform fee`
        );
      } catch (error) {
        errorCount++;
        functions.logger.error(
          `Failed to update founder rate for cafe ${cafeDoc.id}`,
          error
        );
      }
    }

    functions.logger.info(
      `Founder rate expiry complete: ${updatedCount} updated, ${errorCount} errors`
    );
  });

/**
 * redeemToken — Callable Function
 *
 * Called by cafe staff when scanning a QR code or entering a backup code.
 * Validates the token, marks it redeemed, and credits the cafe's ledger.
 *
 * PRD Section 8.4: Redemption flow
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface RedeemRequest {
  /** Either the full QR payload or the 4-digit backup code */
  code: string;
  cafeId: string;
}

interface RedeemResponse {
  success: boolean;
  orderId: string;
  credits: number;
  items: Array<{ name: string; quantity: number }>;
}

export const redeemToken = functions.https.onCall(
  async (data: RedeemRequest, context): Promise<RedeemResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const { code, cafeId } = data;
    if (!code || !cafeId) {
      throw new functions.https.HttpsError('invalid-argument', 'code and cafeId are required');
    }

    const db = admin.firestore();

    // Verify caller is cafe staff/owner
    const cafeDoc = await db.collection('cafes').doc(cafeId).get();
    if (!cafeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Cafe not found');
    }

    const cafe = cafeDoc.data()!;
    const isOwner = cafe.ownerId === context.auth.uid;
    const isStaff = (cafe.staffIds ?? []).includes(context.auth.uid);

    if (!isOwner && !isStaff) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized for this cafe');
    }

    // Find the token — by QR payload or backup code
    let tokenQuery;
    if (code.startsWith('coffeepass://')) {
      tokenQuery = db.collection('redemptionTokens')
        .where('qrPayload', '==', code)
        .where('cafeId', '==', cafeId)
        .where('status', '==', 'active')
        .limit(1);
    } else {
      // 4-digit backup code
      tokenQuery = db.collection('redemptionTokens')
        .where('backupCode', '==', code)
        .where('cafeId', '==', cafeId)
        .where('status', '==', 'active')
        .limit(1);
    }

    const tokenSnap = await tokenQuery.get();
    if (tokenSnap.empty) {
      throw new functions.https.HttpsError('not-found', 'Invalid or expired code');
    }

    const tokenDoc = tokenSnap.docs[0];
    const token = tokenDoc.data();

    // Check expiration
    const expiresAt = token.expiresAt.toDate();
    if (expiresAt < new Date()) {
      // Mark as expired
      await tokenDoc.ref.update({ status: 'expired' });
      throw new functions.https.HttpsError('failed-precondition', 'Token has expired');
    }

    // Get order details for response
    const orderDoc = await db.collection('orders').doc(token.orderId).get();
    const order = orderDoc.data()!;

    try {
      await db.runTransaction(async (txn) => {
        // Mark token as redeemed
        txn.update(tokenDoc.ref, {
          status: 'redeemed',
          redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
          redeemedBy: context.auth!.uid,
        });

        // Update order status
        txn.update(db.collection('orders').doc(token.orderId), {
          status: 'redeemed',
          redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create cafe earnings ledger entry
        // At 12% founder rate: 88¢ per credit
        // At 20% standard rate: 80¢ per credit
        const rateMultiplier = cafe.isFounderRate ? 0.88 : 0.80;
        const payoutAmount = token.creditsHeld * rateMultiplier;

        txn.set(db.collection('cafeEarnings').doc(), {
          cafeId,
          orderId: token.orderId,
          tokenId: tokenDoc.id,
          creditsRedeemed: token.creditsHeld,
          payoutAmount,
          rateType: cafe.isFounderRate ? 'founder' : 'standard',
          status: 'pending_payout',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      functions.logger.info(`Token redeemed for order ${token.orderId}`, {
        cafeId,
        credits: token.creditsHeld,
      });

      return {
        success: true,
        orderId: token.orderId,
        credits: token.creditsHeld,
        items: order.items ?? [],
      };
    } catch (error) {
      functions.logger.error('Failed to redeem token', error);
      throw new functions.https.HttpsError('internal', 'Failed to process redemption');
    }
  }
);

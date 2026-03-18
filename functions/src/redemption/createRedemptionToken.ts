/**
 * createRedemptionToken — Callable Function
 *
 * Generates a single-use redemption token (QR code data + 4-digit backup code)
 * for an order. The token has a 15-minute TTL.
 *
 * PRD Section 8.4: Redemption flow
 * Token lifecycle: CREATED → READY_FOR_REDEMPTION → REDEEMED/EXPIRED
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface CreateTokenRequest {
  orderId: string;
}

interface CreateTokenResponse {
  tokenId: string;
  qrPayload: string;
  backupCode: string;
  expiresAt: string;
}

/** Generate a 4-digit numeric backup code */
function generateBackupCode(): string {
  return String(crypto.randomInt(1000, 9999));
}

/** Generate a cryptographically secure token for QR code */
function generateQRPayload(tokenId: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  return `coffeepass://redeem/${tokenId}/${nonce}`;
}

export const createRedemptionToken = functions.https.onCall(
  async (data: CreateTokenRequest, context): Promise<CreateTokenResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const { orderId } = data;
    if (!orderId) {
      throw new functions.https.HttpsError('invalid-argument', 'orderId is required');
    }

    const db = admin.firestore();
    const userId = context.auth.uid;

    // Verify order belongs to user and is in correct state
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const order = orderDoc.data()!;
    if (order.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Not your order');
    }

    if (order.status !== 'created') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Order is ${order.status}, expected 'created'`
      );
    }

    // Check user has enough credits
    const userDoc = await db.collection('users').doc(userId).get();
    const balance = userDoc.data()?.creditBalance ?? 0;
    if (balance < order.totalCredits) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Insufficient credits: have ${balance}, need ${order.totalCredits}`
      );
    }

    try {
      const tokenRef = db.collection('redemptionTokens').doc();
      const tokenId = tokenRef.id;
      const backupCode = generateBackupCode();
      const qrPayload = generateQRPayload(tokenId);

      // 15-minute TTL
      const TTL_MINUTES = 15;
      const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

      await db.runTransaction(async (txn) => {
        // Debit credits from user
        const freshUser = await txn.get(db.collection('users').doc(userId));
        const currentBalance = freshUser.data()?.creditBalance ?? 0;

        if (currentBalance < order.totalCredits) {
          throw new Error('Insufficient credits');
        }

        txn.update(db.collection('users').doc(userId), {
          creditBalance: currentBalance - order.totalCredits,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create token
        txn.set(tokenRef, {
          id: tokenId,
          orderId,
          userId,
          cafeId: order.cafeId,
          qrPayload,
          backupCode,
          status: 'active',
          creditsHeld: order.totalCredits,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        });

        // Update order status
        txn.update(db.collection('orders').doc(orderId), {
          status: 'ready_for_redemption',
          redemptionTokenId: tokenId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create ledger entry
        txn.set(db.collection('creditLedger').doc(), {
          userId,
          type: 'redemption_hold',
          amount: -order.totalCredits,
          balanceAfter: currentBalance - order.totalCredits,
          referenceId: orderId,
          description: `Held ${order.totalCredits} credits for order`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      functions.logger.info(`Redemption token created for order ${orderId}`, {
        tokenId,
        expiresAt: expiresAt.toISOString(),
      });

      return {
        tokenId,
        qrPayload,
        backupCode,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      functions.logger.error('Failed to create redemption token', error);
      throw new functions.https.HttpsError('internal', 'Failed to create redemption token');
    }
  }
);

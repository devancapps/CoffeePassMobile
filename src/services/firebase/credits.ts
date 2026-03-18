/**
 * Credits Firebase Service
 *
 * Client-side operations for credit purchases, balance queries,
 * and ledger history.
 *
 * PRD Section 8.1: Credit bundles & pricing
 * PRD Section 10: creditPurchases, creditLedger collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '@/config/firebase';
import { getFunctions } from 'firebase/functions';
import type { CreditPurchase, CreditLedgerEntry } from '@/models';

const functions = getFunctions();

// ─── Credit Balance ─────────────────────────────────────

export async function getCreditBalance(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return 0;
  return snap.data().creditBalance ?? 0;
}

// ─── Purchase Credits ───────────────────────────────────

export interface PurchaseResult {
  clientSecret: string;
  purchaseId: string;
}

/**
 * Initiates a credit purchase by calling the Cloud Function.
 * Returns a Stripe clientSecret for the mobile app to confirm payment.
 */
export async function purchaseCredits(bundleId: string): Promise<PurchaseResult> {
  const callable = httpsCallable<{ bundleId: string }, PurchaseResult>(
    functions,
    'purchaseCredits'
  );
  const result = await callable({ bundleId });
  return result.data;
}

// ─── Purchase History ───────────────────────────────────

export interface PurchaseHistoryOptions {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export async function getPurchaseHistory(
  userId: string,
  options: PurchaseHistoryOptions = {}
): Promise<{ purchases: CreditPurchase[]; lastDoc: QueryDocumentSnapshot | null }> {
  const { pageSize = 20, lastDoc } = options;

  let q = query(
    collection(db, 'creditPurchases'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  const purchases = snap.docs.map((d) => d.data() as CreditPurchase);
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { purchases, lastDoc: last };
}

// ─── Credit Ledger ──────────────────────────────────────

export interface LedgerOptions {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export async function getCreditLedger(
  userId: string,
  options: LedgerOptions = {}
): Promise<{ entries: CreditLedgerEntry[]; lastDoc: QueryDocumentSnapshot | null }> {
  const { pageSize = 50, lastDoc } = options;

  let q = query(
    collection(db, 'creditLedger'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  const entries = snap.docs.map((d) => d.data() as CreditLedgerEntry);
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { entries, lastDoc: last };
}

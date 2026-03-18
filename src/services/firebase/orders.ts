/**
 * Orders Firebase Service
 *
 * Client-side operations for order creation, status queries,
 * and redemption token management.
 *
 * PRD Section 8.4: Order lifecycle
 * CREATED → READY_FOR_REDEMPTION → REDEEMED / EXPIRED / CANCELLED
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { db } from '@/config/firebase';
import type { Order, RedemptionToken } from '@/models';
import { OrderStatus } from '@/config/constants';

const functions = getFunctions();

// ─── Types ──────────────────────────────────────────────

export interface OrderItem {
  menuItemId: string;
  name: string;
  creditPrice: number;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  cafeId: string;
  cafeName: string;
  items: OrderItem[];
}

// ─── Create Order ───────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const orderRef = doc(collection(db, 'orders'));
  const orderId = orderRef.id;

  const totalCredits = input.items.reduce(
    (sum, item) => sum + item.creditPrice * item.quantity,
    0
  );

  const orderData = {
    id: orderId,
    userId: input.userId,
    cafeId: input.cafeId,
    cafeName: input.cafeName,
    items: input.items,
    totalCredits,
    status: OrderStatus.CREATED,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(orderRef, orderData);
  return orderId;
}

// ─── Get Order ──────────────────────────────────────────

export async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return snap.data() as Order;
}

// ─── User Orders ────────────────────────────────────────

export interface UserOrdersOptions {
  status?: OrderStatus;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export async function getUserOrders(
  userId: string,
  options: UserOrdersOptions = {}
): Promise<{ orders: Order[]; lastDoc: QueryDocumentSnapshot | null }> {
  const { status, pageSize = 20, lastDoc } = options;

  const constraints = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ];

  if (status) {
    constraints.splice(1, 0, where('status', '==', status));
  }

  let q = query(collection(db, 'orders'), ...constraints);

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => d.data() as Order);
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { orders, lastDoc: last };
}

// ─── Cafe Orders (for cafe dashboard) ───────────────────

export async function getCafeOrders(
  cafeId: string,
  options: UserOrdersOptions = {}
): Promise<{ orders: Order[]; lastDoc: QueryDocumentSnapshot | null }> {
  const { status, pageSize = 20, lastDoc } = options;

  const constraints = [
    where('cafeId', '==', cafeId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ];

  if (status) {
    constraints.splice(1, 0, where('status', '==', status));
  }

  let q = query(collection(db, 'orders'), ...constraints);

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => d.data() as Order);
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { orders, lastDoc: last };
}

// ─── Redemption Tokens ──────────────────────────────────

export interface CreateTokenResult {
  tokenId: string;
  qrPayload: string;
  backupCode: string;
  expiresAt: string;
}

/**
 * Creates a redemption token for an order via Cloud Function.
 * Debits credits and generates QR code + 4-digit backup code.
 */
export async function createRedemptionToken(
  orderId: string
): Promise<CreateTokenResult> {
  const callable = httpsCallable<{ orderId: string }, CreateTokenResult>(
    functions,
    'createRedemptionToken'
  );
  const result = await callable({ orderId });
  return result.data;
}

/**
 * Redeems a token at a cafe (called by cafe staff).
 */
export interface RedeemResult {
  success: boolean;
  orderId: string;
  credits: number;
  items: Array<{ name: string; quantity: number }>;
}

export async function redeemToken(
  code: string,
  cafeId: string
): Promise<RedeemResult> {
  const callable = httpsCallable<{ code: string; cafeId: string }, RedeemResult>(
    functions,
    'redeemToken'
  );
  const result = await callable({ code, cafeId });
  return result.data;
}

/**
 * Get the active redemption token for an order.
 */
export async function getRedemptionToken(
  orderId: string
): Promise<RedemptionToken | null> {
  const q = query(
    collection(db, 'redemptionTokens'),
    where('orderId', '==', orderId),
    where('status', '==', 'active'),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as RedemptionToken;
}

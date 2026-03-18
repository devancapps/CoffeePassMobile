/**
 * Cafe Firebase Service
 *
 * Client-side Firestore operations for the cafes collection.
 * Handles cafe CRUD, menu items, and discovery queries.
 *
 * PRD Section 10: cafes/{cafeId}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  GeoPoint,
  serverTimestamp,
  QueryDocumentSnapshot,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Cafe, MenuItem, Address, WeeklyHours } from '@/models';
import { CafeStatus, MenuCategory } from '@/config/constants';

// ─── Cafe CRUD ──────────────────────────────────────────

export interface CreateCafeInput {
  ownerId: string;
  name: string;
  description: string;
  address: Address;
  phone: string;
  hours: WeeklyHours;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export async function createCafe(input: CreateCafeInput): Promise<string> {
  const cafeRef = doc(collection(db, 'cafes'));
  const cafeId = cafeRef.id;

  const cafeData = {
    id: cafeId,
    ownerId: input.ownerId,
    name: input.name,
    description: input.description,
    address: input.address,
    phone: input.phone,
    hours: input.hours,
    location: new GeoPoint(input.latitude, input.longitude),
    photoUrl: input.photoUrl ?? null,
    coverPhotoUrl: null,
    status: CafeStatus.PENDING_REVIEW,
    isFounderRate: true, // Early cafes get founder rate
    averageRating: 0,
    totalRedemptions: 0,
    stripeAccountId: null,
    stripeOnboardingComplete: false,
    staffIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(cafeRef, cafeData);
  return cafeId;
}

export async function getCafe(cafeId: string): Promise<Cafe | null> {
  const snap = await getDoc(doc(db, 'cafes', cafeId));
  if (!snap.exists()) return null;
  return snap.data() as Cafe;
}

export async function updateCafe(
  cafeId: string,
  updates: Partial<Omit<Cafe, 'id' | 'ownerId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'cafes', cafeId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getCafeByOwner(ownerId: string): Promise<Cafe | null> {
  const q = query(
    collection(db, 'cafes'),
    where('ownerId', '==', ownerId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Cafe;
}

// ─── Discovery / Search ─────────────────────────────────

export interface DiscoveryCafesOptions {
  status?: CafeStatus;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export async function getActiveCafes(
  options: DiscoveryCafesOptions = {}
): Promise<{ cafes: Cafe[]; lastDoc: QueryDocumentSnapshot | null }> {
  const { status = CafeStatus.ACTIVE, pageSize = 20, lastDoc } = options;

  let q = query(
    collection(db, 'cafes'),
    where('status', '==', status),
    orderBy('name'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  const cafes = snap.docs.map((d) => d.data() as Cafe);
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { cafes, lastDoc: last };
}

// ─── Menu Items ─────────────────────────────────────────

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  creditPrice: number;
  category: MenuCategory;
  photoUrl?: string;
}

export async function addMenuItem(
  cafeId: string,
  item: CreateMenuItemInput
): Promise<string> {
  const ref = await addDoc(collection(db, 'cafes', cafeId, 'menuItems'), {
    ...item,
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMenuItems(cafeId: string): Promise<MenuItem[]> {
  const q = query(
    collection(db, 'cafes', cafeId, 'menuItems'),
    where('isAvailable', '==', true),
    orderBy('category'),
    orderBy('name')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function updateMenuItem(
  cafeId: string,
  itemId: string,
  updates: Partial<CreateMenuItemInput & { isAvailable: boolean }>
): Promise<void> {
  await updateDoc(doc(db, 'cafes', cafeId, 'menuItems', itemId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMenuItem(
  cafeId: string,
  itemId: string
): Promise<void> {
  await deleteDoc(doc(db, 'cafes', cafeId, 'menuItems', itemId));
}

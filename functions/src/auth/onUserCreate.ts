/**
 * onUserCreate — Auth Trigger
 *
 * Fires when a new Firebase Auth user is created.
 * Creates the corresponding Firestore user document with defaults.
 *
 * PRD Section 10: users/{userId}
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  role: 'consumer' | 'cafe_owner' | 'cafe_staff' | 'admin';
  creditBalance: number;
  authProvider: string;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
}

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();

  const userDoc: UserDocument = {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'New User',
    role: 'consumer', // Default; updated by RoleSelection screen
    creditBalance: 0,
    authProvider: user.providerData?.[0]?.providerId ?? 'email',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('users').doc(user.uid).set(userDoc);
    functions.logger.info(`User document created for ${user.uid}`, { email: user.email });
  } catch (error) {
    functions.logger.error(`Failed to create user document for ${user.uid}`, error);
    throw error;
  }
});

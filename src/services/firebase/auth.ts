/**
 * Firebase Auth Service
 *
 * Real Firebase Authentication integration.
 * Handles email/password auth, session management, and user document creation.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/models';
import { UserRole } from '@/config/constants';

/**
 * Translate a Firebase error code into a user-friendly message.
 */
function translateAuthError(code: string): string {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already in use. Log in instead?',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 8 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
  };
  return errorMap[code] ?? 'Something went wrong. Please try again.';
}

/**
 * Fetch or create the Firestore user document for a Firebase Auth user.
 */
async function getOrCreateUserDoc(
  firebaseUser: FirebaseUser,
  extras?: { displayName?: string; role?: UserRole },
): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: firebaseUser.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      cafeId: data.cafeId,
      creditBalance: data.creditBalance ?? 0,
      photoUrl: data.photoUrl,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      fcmToken: data.fcmToken,
      authProvider: data.authProvider ?? 'email',
    };
  }

  // First login — create Firestore doc
  const newUser: Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>; updatedAt: ReturnType<typeof serverTimestamp> } = {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: extras?.displayName ?? firebaseUser.displayName ?? '',
    role: extras?.role ?? UserRole.CONSUMER,
    creditBalance: 0,
    authProvider: 'email',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  await setDoc(userRef, newUser);

  return {
    ...newUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
}

/**
 * Sign up with email, password, and display name.
 * Creates both Firebase Auth user and Firestore user document.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = UserRole.CONSUMER,
): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    return await getOrCreateUserDoc(credential.user, { displayName, role });
  } catch (error: any) {
    throw new Error(translateAuthError(error?.code ?? ''));
  }
}

/**
 * Sign in with email and password.
 * Fetches the existing Firestore user document.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return await getOrCreateUserDoc(credential.user);
  } catch (error: any) {
    throw new Error(translateAuthError(error?.code ?? ''));
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send a password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(translateAuthError(error?.code ?? ''));
  }
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await getOrCreateUserDoc(firebaseUser);
        callback(user);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get the current Firebase Auth user (if any).
 */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Update the user's role in Firestore.
 * Used during onboarding when a user selects their role.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { role, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Update user profile fields in Firestore.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'photoUrl' | 'fcmToken'>>,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

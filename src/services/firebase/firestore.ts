/**
 * Firestore Service
 *
 * Typed helper functions for Firestore CRUD operations.
 * TODO: Replace stubs with real Firestore calls in Phase 2+.
 */

/** Get a single document by ID */
export async function getDocument<T>(
  _collection: string,
  _id: string,
): Promise<T | null> {
  // TODO: Implement with getDoc(doc(db, collection, id))
  throw new Error('Not implemented — Firestore service stub');
}

/** Query documents with constraints */
export async function queryDocuments<T>(
  _collection: string,
  ..._constraints: unknown[]
): Promise<T[]> {
  // TODO: Implement with getDocs(query(collection(db, path), ...constraints))
  throw new Error('Not implemented — Firestore service stub');
}

/** Set (create or overwrite) a document */
export async function setDocument<T extends Record<string, unknown>>(
  _collection: string,
  _id: string,
  _data: T,
): Promise<void> {
  // TODO: Implement with setDoc(doc(db, collection, id), data)
  throw new Error('Not implemented — Firestore service stub');
}

/** Update specific fields on an existing document */
export async function updateDocument(
  _collection: string,
  _id: string,
  _data: Record<string, unknown>,
): Promise<void> {
  // TODO: Implement with updateDoc(doc(db, collection, id), data)
  throw new Error('Not implemented — Firestore service stub');
}

/** Delete a document */
export async function deleteDocument(
  _collection: string,
  _id: string,
): Promise<void> {
  // TODO: Implement with deleteDoc(doc(db, collection, id))
  throw new Error('Not implemented — Firestore service stub');
}

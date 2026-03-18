/**
 * Firebase Storage Service
 *
 * Stub implementations for image upload and retrieval.
 * TODO: Replace with real Firebase Storage calls in Phase 3 (onboarding).
 */

/** Upload an image and return its download URL */
export async function uploadImage(
  _path: string,
  _uri: string,
): Promise<string> {
  // TODO: Implement with uploadBytesResumable + getDownloadURL
  console.warn('uploadImage is a stub — returning placeholder URL');
  return 'https://via.placeholder.com/300x200.png?text=CoffeePass';
}

/** Get the download URL for an existing file */
export async function getImageUrl(_path: string): Promise<string> {
  // TODO: Implement with getDownloadURL(ref(storage, path))
  console.warn('getImageUrl is a stub — returning placeholder URL');
  return 'https://via.placeholder.com/300x200.png?text=CoffeePass';
}

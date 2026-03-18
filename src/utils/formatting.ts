/**
 * CoffeePass Formatting Utilities
 *
 * Pure functions for display formatting and input validation.
 */

/** Format a credit amount for display: "5 credits" or "1 credit" */
export function formatCredits(amount: number): string {
  return `${amount} ${amount === 1 ? 'credit' : 'credits'}`;
}

/** Format cents to dollar string: 499 → "$4.99" */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Format distance in miles: 0.3 → "0.3 mi", 2.0 → "2 mi" */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  return miles % 1 === 0 ? `${miles} mi` : `${miles.toFixed(1)} mi`;
}

/** Format a Date to short display: "Mar 15, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format time remaining from a future date: "14:32" countdown */
export function formatCountdown(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return '0:00';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Basic email validation */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/** Password validation with detailed feedback */
export function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true, message: '' };
}

/** Validate display name */
export function validateName(name: string): {
  valid: boolean;
  message: string;
} {
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  return { valid: true, message: '' };
}

/**
 * Formatting Utilities Tests
 *
 * Tests all pure functions from src/utils/formatting.ts.
 */

import {
  formatCredits,
  formatCurrency,
  formatDistance,
  formatDate,
  formatCountdown,
  validateEmail,
  validatePassword,
  validateName,
} from '../src/utils/formatting';

// ─── formatCredits ───────────────────────────────────────

describe('formatCredits', () => {
  test('singular: 1 credit', () => {
    expect(formatCredits(1)).toBe('1 credit');
  });

  test('plural: 5 credits', () => {
    expect(formatCredits(5)).toBe('5 credits');
  });

  test('zero: 0 credits (plural)', () => {
    expect(formatCredits(0)).toBe('0 credits');
  });

  test('large number', () => {
    expect(formatCredits(100)).toBe('100 credits');
  });

  test('two credits', () => {
    expect(formatCredits(2)).toBe('2 credits');
  });
});

// ─── formatCurrency ──────────────────────────────────────

describe('formatCurrency', () => {
  test('499 cents → "$4.99"', () => {
    expect(formatCurrency(499)).toBe('$4.99');
  });

  test('0 cents → "$0.00"', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('100 cents → "$1.00"', () => {
    expect(formatCurrency(100)).toBe('$1.00');
  });

  test('1999 cents → "$19.99"', () => {
    expect(formatCurrency(1999)).toBe('$19.99');
  });

  test('1 cent → "$0.01"', () => {
    expect(formatCurrency(1)).toBe('$0.01');
  });

  test('7499 cents → "$74.99"', () => {
    expect(formatCurrency(7499)).toBe('$74.99');
  });
});

// ─── formatDistance ──────────────────────────────────────

describe('formatDistance', () => {
  test('very small distance → "< 0.1 mi"', () => {
    expect(formatDistance(0.05)).toBe('< 0.1 mi');
  });

  test('0.0 → "< 0.1 mi"', () => {
    expect(formatDistance(0)).toBe('< 0.1 mi');
  });

  test('fractional distance → "0.3 mi"', () => {
    expect(formatDistance(0.3)).toBe('0.3 mi');
  });

  test('whole number → "2 mi" (no decimal)', () => {
    expect(formatDistance(2.0)).toBe('2 mi');
  });

  test('1.0 → "1 mi"', () => {
    expect(formatDistance(1.0)).toBe('1 mi');
  });

  test('0.1 boundary → "0.1 mi"', () => {
    expect(formatDistance(0.1)).toBe('0.1 mi');
  });

  test('large distance', () => {
    expect(formatDistance(10.0)).toBe('10 mi');
  });

  test('decimal value → shows one decimal place', () => {
    expect(formatDistance(3.7)).toBe('3.7 mi');
  });
});

// ─── formatDate ──────────────────────────────────────────

describe('formatDate', () => {
  test('formats a known date as "Mon DD, YYYY"', () => {
    // March 15, 2026
    const date = new Date(2026, 2, 15);
    const result = formatDate(date);
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2026/);
  });

  test('formats January 1, 2025', () => {
    const date = new Date(2025, 0, 1);
    const result = formatDate(date);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/2025/);
  });

  test('formats December 31, 2024', () => {
    const date = new Date(2024, 11, 31);
    const result = formatDate(date);
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/31/);
    expect(result).toMatch(/2024/);
  });
});

// ─── formatCountdown ────────────────────────────────────

describe('formatCountdown', () => {
  test('future date returns "M:SS" format', () => {
    const future = new Date(Date.now() + 5 * 60 * 1000 + 30 * 1000); // 5:30 from now
    const result = formatCountdown(future);
    // Should be approximately "5:30" (may vary by a second due to test execution time)
    expect(result).toMatch(/^\d+:\d{2}$/);
  });

  test('past date returns "0:00"', () => {
    const past = new Date(Date.now() - 10000);
    expect(formatCountdown(past)).toBe('0:00');
  });

  test('exactly now returns "0:00"', () => {
    const realNow = Date.now;
    const fixedTime = Date.now();
    Date.now = () => fixedTime;
    try {
      expect(formatCountdown(new Date(fixedTime))).toBe('0:00');
    } finally {
      Date.now = realNow;
    }
  });

  test('one minute from now returns approximately "1:00"', () => {
    const realNow = Date.now;
    const fixedTime = Date.now();
    Date.now = () => fixedTime;
    try {
      const oneMinute = new Date(fixedTime + 60 * 1000);
      expect(formatCountdown(oneMinute)).toBe('1:00');
    } finally {
      Date.now = realNow;
    }
  });

  test('seconds are zero-padded', () => {
    const realNow = Date.now;
    const fixedTime = Date.now();
    Date.now = () => fixedTime;
    try {
      const fiveSeconds = new Date(fixedTime + 5 * 1000);
      expect(formatCountdown(fiveSeconds)).toBe('0:05');
    } finally {
      Date.now = realNow;
    }
  });

  test('14 minutes 32 seconds', () => {
    const realNow = Date.now;
    const fixedTime = Date.now();
    Date.now = () => fixedTime;
    try {
      const target = new Date(fixedTime + 14 * 60 * 1000 + 32 * 1000);
      expect(formatCountdown(target)).toBe('14:32');
    } finally {
      Date.now = realNow;
    }
  });
});

// ─── validateEmail ──────────────────────────────────────

describe('validateEmail', () => {
  test('valid standard email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('valid email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true);
  });

  test('valid email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  test('valid email with leading/trailing spaces (trimmed)', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true);
  });

  test('invalid: missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  test('invalid: missing domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  test('invalid: missing local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  test('invalid: spaces in middle', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });

  test('invalid: empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('invalid: no TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });
});

// ─── validatePassword ───────────────────────────────────

describe('validatePassword', () => {
  test('too short (< 8 chars) is invalid', () => {
    const result = validatePassword('abc');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8 characters');
  });

  test('exactly 7 chars is invalid', () => {
    expect(validatePassword('1234567').valid).toBe(false);
  });

  test('exactly 8 chars is valid', () => {
    const result = validatePassword('12345678');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('long password is valid', () => {
    expect(validatePassword('a'.repeat(50)).valid).toBe(true);
  });

  test('empty password is invalid', () => {
    expect(validatePassword('').valid).toBe(false);
  });
});

// ─── validateName ───────────────────────────────────────

describe('validateName', () => {
  test('too short (< 2 chars) is invalid', () => {
    const result = validateName('A');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('2 characters');
  });

  test('exactly 2 chars is valid', () => {
    const result = validateName('AB');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('normal name is valid', () => {
    expect(validateName('John Doe').valid).toBe(true);
  });

  test('empty string is invalid', () => {
    expect(validateName('').valid).toBe(false);
  });

  test('whitespace-only string is invalid (trimmed)', () => {
    expect(validateName('   ').valid).toBe(false);
  });

  test('single char with spaces is invalid after trim', () => {
    expect(validateName(' A ').valid).toBe(false);
  });
});

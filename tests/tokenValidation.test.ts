/**
 * Redemption Token Validation Tests
 *
 * Tests pure validation logic for redemption tokens and backup codes.
 */

// ─── Pure Functions Under Test ───────────────────────────

/**
 * Check if a token has expired based on its expiresAt timestamp.
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return Date.now() >= expiresAt.getTime();
}

/**
 * Validate a redemption token: must be active, not expired, and match the cafe.
 */
export function isTokenValid(
  token: { status: string; expiresAt: Date; cafeId: string },
  requestedCafeId: string
): boolean {
  if (token.status !== 'active') return false;
  if (isTokenExpired(token.expiresAt)) return false;
  if (token.cafeId !== requestedCafeId) return false;
  return true;
}

/**
 * Generate a random 4-digit backup code (1000-9999).
 */
export function generateBackupCode(): string {
  const code = Math.floor(1000 + Math.random() * 9000);
  return code.toString();
}

/**
 * Validate that a backup code is exactly 4 digits in the range 1000-9999.
 */
export function validateBackupCode(code: string): boolean {
  if (!/^\d{4}$/.test(code)) return false;
  const num = parseInt(code, 10);
  return num >= 1000 && num <= 9999;
}

// ─── Tests ───────────────────────────────────────────────

describe('isTokenExpired', () => {
  test('returns false for a future expiry time', () => {
    const future = new Date(Date.now() + 15 * 60 * 1000); // 15 min from now
    expect(isTokenExpired(future)).toBe(false);
  });

  test('returns true for a past expiry time', () => {
    const past = new Date(Date.now() - 1000); // 1 second ago
    expect(isTokenExpired(past)).toBe(true);
  });

  test('returns true when exactly at expiry time', () => {
    const now = new Date();
    // Mock Date.now to be exactly at expiry
    const realNow = Date.now;
    Date.now = () => now.getTime();
    try {
      expect(isTokenExpired(now)).toBe(true);
    } finally {
      Date.now = realNow;
    }
  });

  test('returns false for far-future expiry', () => {
    const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    expect(isTokenExpired(farFuture)).toBe(false);
  });
});

describe('isTokenValid', () => {
  const baseCafeId = 'cafe_123';

  function makeToken(overrides: Partial<{ status: string; expiresAt: Date; cafeId: string }> = {}) {
    return {
      status: 'active',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min from now
      cafeId: baseCafeId,
      ...overrides,
    };
  }

  test('returns true for a valid, active, non-expired token at the correct cafe', () => {
    expect(isTokenValid(makeToken(), baseCafeId)).toBe(true);
  });

  test('returns false when status is "redeemed"', () => {
    expect(isTokenValid(makeToken({ status: 'redeemed' }), baseCafeId)).toBe(false);
  });

  test('returns false when status is "expired"', () => {
    expect(isTokenValid(makeToken({ status: 'expired' }), baseCafeId)).toBe(false);
  });

  test('returns false when status is empty string', () => {
    expect(isTokenValid(makeToken({ status: '' }), baseCafeId)).toBe(false);
  });

  test('returns false when token is expired', () => {
    const expired = makeToken({ expiresAt: new Date(Date.now() - 5000) });
    expect(isTokenValid(expired, baseCafeId)).toBe(false);
  });

  test('returns false when cafeId does not match', () => {
    expect(isTokenValid(makeToken(), 'cafe_999')).toBe(false);
  });

  test('returns false when cafeId is empty', () => {
    expect(isTokenValid(makeToken(), '')).toBe(false);
  });

  test('returns false when multiple fields are invalid', () => {
    const bad = makeToken({
      status: 'redeemed',
      expiresAt: new Date(Date.now() - 1000),
      cafeId: 'wrong_cafe',
    });
    expect(isTokenValid(bad, baseCafeId)).toBe(false);
  });
});

describe('generateBackupCode', () => {
  test('returns a 4-character string', () => {
    const code = generateBackupCode();
    expect(code).toHaveLength(4);
  });

  test('returns only digit characters', () => {
    const code = generateBackupCode();
    expect(code).toMatch(/^\d{4}$/);
  });

  test('returns a number in range 1000-9999', () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 100; i++) {
      const code = generateBackupCode();
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(1000);
      expect(num).toBeLessThanOrEqual(9999);
    }
  });

  test('generates varying codes (not always the same)', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateBackupCode());
    }
    // With 50 attempts and 9000 possible values, we expect multiple distinct codes
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('validateBackupCode', () => {
  test('accepts valid 4-digit codes', () => {
    expect(validateBackupCode('1000')).toBe(true);
    expect(validateBackupCode('5555')).toBe(true);
    expect(validateBackupCode('9999')).toBe(true);
  });

  test('rejects codes below 1000', () => {
    expect(validateBackupCode('0000')).toBe(false);
    expect(validateBackupCode('0999')).toBe(false);
    expect(validateBackupCode('0001')).toBe(false);
  });

  test('rejects non-numeric strings', () => {
    expect(validateBackupCode('abcd')).toBe(false);
    expect(validateBackupCode('12ab')).toBe(false);
    expect(validateBackupCode('!@#$')).toBe(false);
  });

  test('rejects strings that are not exactly 4 characters', () => {
    expect(validateBackupCode('123')).toBe(false);
    expect(validateBackupCode('12345')).toBe(false);
    expect(validateBackupCode('')).toBe(false);
    expect(validateBackupCode('1')).toBe(false);
  });

  test('rejects codes with spaces', () => {
    expect(validateBackupCode(' 123')).toBe(false);
    expect(validateBackupCode('123 ')).toBe(false);
    expect(validateBackupCode('1 23')).toBe(false);
  });

  test('rejects codes with decimal points', () => {
    expect(validateBackupCode('1.23')).toBe(false);
  });
});

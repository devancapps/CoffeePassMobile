/**
 * Credit Math & Platform Economics Tests
 *
 * Validates credit bundle pricing, discount calculations,
 * and platform fee/payout economics from constants.
 */

import { CREDIT_BUNDLES, PLATFORM } from '../src/config/constants';

describe('Credit Bundles', () => {
  test('each bundle pricePerCredit matches priceCents / credits (rounded to 2 decimals)', () => {
    for (const bundle of CREDIT_BUNDLES) {
      const calculated = Math.round((bundle.priceCents / bundle.credits)) / 100;
      expect(bundle.pricePerCredit).toBeCloseTo(calculated, 2);
    }
  });

  test('discount percentages are correct relative to $1.00 base price per credit', () => {
    const basePricePerCredit = 1.0;
    for (const bundle of CREDIT_BUNDLES) {
      const expectedDiscount = Math.round(
        (1 - bundle.pricePerCredit / basePricePerCredit) * 100
      );
      expect(bundle.discountPercent).toBe(expectedDiscount);
    }
  });

  test('bundles are sorted by ascending credits', () => {
    for (let i = 1; i < CREDIT_BUNDLES.length; i++) {
      expect(CREDIT_BUNDLES[i].credits).toBeGreaterThan(
        CREDIT_BUNDLES[i - 1].credits
      );
    }
  });

  test('all bundles have positive priceCents and credits', () => {
    for (const bundle of CREDIT_BUNDLES) {
      expect(bundle.priceCents).toBeGreaterThan(0);
      expect(bundle.credits).toBeGreaterThan(0);
    }
  });

  test('all bundles have unique IDs', () => {
    const ids = CREDIT_BUNDLES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('higher credit bundles have lower or equal pricePerCredit', () => {
    for (let i = 1; i < CREDIT_BUNDLES.length; i++) {
      expect(CREDIT_BUNDLES[i].pricePerCredit).toBeLessThanOrEqual(
        CREDIT_BUNDLES[i - 1].pricePerCredit
      );
    }
  });
});

describe('Platform Economics', () => {
  test('standard fee rate is 20%', () => {
    expect(PLATFORM.STANDARD_FEE_RATE).toBe(0.20);
  });

  test('founder fee rate is 12%', () => {
    expect(PLATFORM.FOUNDER_FEE_RATE).toBe(0.12);
  });

  test('standard payout per credit is $0.80', () => {
    expect(PLATFORM.STANDARD_PAYOUT_PER_CREDIT).toBe(0.80);
  });

  test('founder payout per credit is $0.88', () => {
    expect(PLATFORM.FOUNDER_PAYOUT_PER_CREDIT).toBe(0.88);
  });

  test('standard payout = 1 - standard fee', () => {
    expect(PLATFORM.STANDARD_PAYOUT_PER_CREDIT).toBeCloseTo(
      1 - PLATFORM.STANDARD_FEE_RATE,
      2
    );
  });

  test('founder payout = 1 - founder fee', () => {
    expect(PLATFORM.FOUNDER_PAYOUT_PER_CREDIT).toBeCloseTo(
      1 - PLATFORM.FOUNDER_FEE_RATE,
      2
    );
  });

  test('minimum payout threshold is $5.00 (500 cents)', () => {
    expect(PLATFORM.MIN_PAYOUT_CENTS).toBe(500);
  });

  test('credit expiry is 12 months', () => {
    expect(PLATFORM.CREDIT_EXPIRY_MONTHS).toBe(12);
  });

  test('founder rate is more favorable than standard rate', () => {
    expect(PLATFORM.FOUNDER_FEE_RATE).toBeLessThan(PLATFORM.STANDARD_FEE_RATE);
    expect(PLATFORM.FOUNDER_PAYOUT_PER_CREDIT).toBeGreaterThan(
      PLATFORM.STANDARD_PAYOUT_PER_CREDIT
    );
  });
});

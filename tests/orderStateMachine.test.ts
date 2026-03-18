/**
 * Order State Machine Tests
 *
 * Validates the allowed and disallowed transitions in the order lifecycle.
 * Encodes the state machine from PRD Section 10.
 */

import { OrderStatus } from '../src/config/constants';

// ─── State Machine Definition ────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [
    OrderStatus.READY_FOR_REDEMPTION,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.READY_FOR_REDEMPTION]: [
    OrderStatus.REDEEMED,
    OrderStatus.EXPIRED,
  ],
  [OrderStatus.REDEEMED]: [],    // terminal state
  [OrderStatus.EXPIRED]: [],     // terminal state
  [OrderStatus.CANCELLED]: [],   // terminal state
};

/**
 * Determine if a status transition is valid according to the order lifecycle.
 */
export function isValidTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

// ─── Tests ───────────────────────────────────────────────

describe('Order State Machine', () => {
  describe('valid transitions', () => {
    test('CREATED → READY_FOR_REDEMPTION', () => {
      expect(
        isValidTransition(OrderStatus.CREATED, OrderStatus.READY_FOR_REDEMPTION)
      ).toBe(true);
    });

    test('CREATED → CANCELLED', () => {
      expect(
        isValidTransition(OrderStatus.CREATED, OrderStatus.CANCELLED)
      ).toBe(true);
    });

    test('READY_FOR_REDEMPTION → REDEEMED', () => {
      expect(
        isValidTransition(
          OrderStatus.READY_FOR_REDEMPTION,
          OrderStatus.REDEEMED
        )
      ).toBe(true);
    });

    test('READY_FOR_REDEMPTION → EXPIRED', () => {
      expect(
        isValidTransition(
          OrderStatus.READY_FOR_REDEMPTION,
          OrderStatus.EXPIRED
        )
      ).toBe(true);
    });
  });

  describe('invalid transitions from terminal states', () => {
    test('REDEEMED → CANCELLED (terminal state)', () => {
      expect(
        isValidTransition(OrderStatus.REDEEMED, OrderStatus.CANCELLED)
      ).toBe(false);
    });

    test('REDEEMED → any other state', () => {
      const allStatuses = Object.values(OrderStatus);
      for (const status of allStatuses) {
        expect(isValidTransition(OrderStatus.REDEEMED, status)).toBe(false);
      }
    });

    test('EXPIRED → READY_FOR_REDEMPTION', () => {
      expect(
        isValidTransition(
          OrderStatus.EXPIRED,
          OrderStatus.READY_FOR_REDEMPTION
        )
      ).toBe(false);
    });

    test('EXPIRED → any other state', () => {
      const allStatuses = Object.values(OrderStatus);
      for (const status of allStatuses) {
        expect(isValidTransition(OrderStatus.EXPIRED, status)).toBe(false);
      }
    });

    test('CANCELLED → any other state', () => {
      const allStatuses = Object.values(OrderStatus);
      for (const status of allStatuses) {
        expect(isValidTransition(OrderStatus.CANCELLED, status)).toBe(false);
      }
    });
  });

  describe('invalid non-sequential transitions', () => {
    test('CREATED → REDEEMED (must go through READY_FOR_REDEMPTION)', () => {
      expect(
        isValidTransition(OrderStatus.CREATED, OrderStatus.REDEEMED)
      ).toBe(false);
    });

    test('CREATED → EXPIRED (must go through READY_FOR_REDEMPTION)', () => {
      expect(
        isValidTransition(OrderStatus.CREATED, OrderStatus.EXPIRED)
      ).toBe(false);
    });

    test('READY_FOR_REDEMPTION → CANCELLED (can only cancel from CREATED)', () => {
      expect(
        isValidTransition(
          OrderStatus.READY_FOR_REDEMPTION,
          OrderStatus.CANCELLED
        )
      ).toBe(false);
    });
  });

  describe('self-transitions', () => {
    test('no status can transition to itself', () => {
      const allStatuses = Object.values(OrderStatus);
      for (const status of allStatuses) {
        expect(isValidTransition(status, status)).toBe(false);
      }
    });
  });

  describe('state machine completeness', () => {
    test('every OrderStatus value is covered in the transition map', () => {
      const allStatuses = Object.values(OrderStatus);
      for (const status of allStatuses) {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      }
    });

    test('terminal states have empty transition arrays', () => {
      expect(VALID_TRANSITIONS[OrderStatus.REDEEMED]).toHaveLength(0);
      expect(VALID_TRANSITIONS[OrderStatus.EXPIRED]).toHaveLength(0);
      expect(VALID_TRANSITIONS[OrderStatus.CANCELLED]).toHaveLength(0);
    });
  });
});

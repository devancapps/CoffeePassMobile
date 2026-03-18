/**
 * Cafe Utilities Tests
 *
 * Tests pure functions from src/utils/cafe.ts including
 * distance calculation, open/closed status, and menu helpers.
 *
 * Note: We import functions directly and define the types inline
 * to avoid pulling in RN-dependent modules through the @/ alias.
 */

import {
  calculateDistance,
  isCafeOpen,
  isClosingSoon,
  getTodayHoursString,
  getMenuPreview,
  getAverageCreditPrice,
  getPriceTier,
} from '../src/utils/cafe';

// ─── Type helpers (mirrors models without importing through @/ alias) ──

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

type WeeklyHours = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DayHours;
};

// ─── Test Fixtures ───────────────────────────────────────

function makeWeeklyHours(overrides: Partial<WeeklyHours> = {}): WeeklyHours {
  const defaultDay: DayHours = { open: '07:00', close: '18:00', closed: false };
  return {
    monday: defaultDay,
    tuesday: defaultDay,
    wednesday: defaultDay,
    thursday: defaultDay,
    friday: defaultDay,
    saturday: { open: '08:00', close: '16:00', closed: false },
    sunday: { open: '08:00', close: '16:00', closed: true },
    ...overrides,
  };
}

/**
 * Create a Date for a specific day of week and time.
 * dayIndex: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
function makeDateForDay(dayIndex: number, hours: number, minutes: number): Date {
  // Find next occurrence of this day of week
  const now = new Date();
  const currentDay = now.getDay();
  const diff = (dayIndex - currentDay + 7) % 7;
  const target = new Date(now);
  target.setDate(target.getDate() + diff);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

// ─── calculateDistance ───────────────────────────────────

describe('calculateDistance', () => {
  test('distance between same point is 0', () => {
    const point = { latitude: 37.7749, longitude: -122.4194 };
    expect(calculateDistance(point, point)).toBeCloseTo(0, 5);
  });

  test('SF City Hall to Golden Gate Bridge is approximately 3.5 miles', () => {
    const cityHall = { latitude: 37.7793, longitude: -122.4193 };
    const goldenGate = { latitude: 37.8199, longitude: -122.4783 };
    const distance = calculateDistance(cityHall, goldenGate);
    // Roughly 3.5-4.5 miles
    expect(distance).toBeGreaterThan(3.0);
    expect(distance).toBeLessThan(5.0);
  });

  test('SF to Oakland (across the bay) is approximately 8-12 miles', () => {
    const sf = { latitude: 37.7749, longitude: -122.4194 };
    const oakland = { latitude: 37.8044, longitude: -122.2712 };
    const distance = calculateDistance(sf, oakland);
    expect(distance).toBeGreaterThan(7);
    expect(distance).toBeLessThan(13);
  });

  test('very close points (< 0.1 mi)', () => {
    const a = { latitude: 37.7749, longitude: -122.4194 };
    const b = { latitude: 37.7750, longitude: -122.4195 };
    const distance = calculateDistance(a, b);
    expect(distance).toBeLessThan(0.1);
    expect(distance).toBeGreaterThan(0);
  });

  test('returns a positive number', () => {
    const a = { latitude: 40.7128, longitude: -74.006 };
    const b = { latitude: 34.0522, longitude: -118.2437 };
    expect(calculateDistance(a, b)).toBeGreaterThan(0);
  });

  test('distance is symmetric (a→b equals b→a)', () => {
    const a = { latitude: 37.7749, longitude: -122.4194 };
    const b = { latitude: 37.8199, longitude: -122.4783 };
    expect(calculateDistance(a, b)).toBeCloseTo(calculateDistance(b, a), 10);
  });
});

// ─── isCafeOpen ─────────────────────────────────────────

describe('isCafeOpen', () => {
  const hours = makeWeeklyHours();

  test('open during business hours on a weekday (Monday 10:00)', () => {
    const monday10am = makeDateForDay(1, 10, 0);
    expect(isCafeOpen(hours, monday10am)).toBe(true);
  });

  test('closed before opening on a weekday (Monday 06:00)', () => {
    const monday6am = makeDateForDay(1, 6, 0);
    expect(isCafeOpen(hours, monday6am)).toBe(false);
  });

  test('closed after closing on a weekday (Monday 19:00)', () => {
    const monday7pm = makeDateForDay(1, 19, 0);
    expect(isCafeOpen(hours, monday7pm)).toBe(false);
  });

  test('open at exactly opening time (Monday 07:00)', () => {
    const mondayOpen = makeDateForDay(1, 7, 0);
    expect(isCafeOpen(hours, mondayOpen)).toBe(true);
  });

  test('closed at exactly closing time (Monday 18:00)', () => {
    const mondayClose = makeDateForDay(1, 18, 0);
    expect(isCafeOpen(hours, mondayClose)).toBe(false);
  });

  test('closed on Sunday (marked as closed)', () => {
    const sunday12pm = makeDateForDay(0, 12, 0);
    expect(isCafeOpen(hours, sunday12pm)).toBe(false);
  });

  test('handles overnight hours', () => {
    const overnightHours = makeWeeklyHours({
      friday: { open: '22:00', close: '02:00', closed: false },
    });
    const fridayMidnight = makeDateForDay(5, 23, 30);
    expect(isCafeOpen(overnightHours, fridayMidnight)).toBe(true);
  });
});

// ─── isClosingSoon ──────────────────────────────────────

describe('isClosingSoon', () => {
  const hours = makeWeeklyHours();

  test('returns true when within 60 minutes of closing', () => {
    // Monday closes at 18:00, check at 17:30
    const monday530pm = makeDateForDay(1, 17, 30);
    expect(isClosingSoon(hours, monday530pm)).toBe(true);
  });

  test('returns true at exactly 60 minutes before closing', () => {
    // Monday closes at 18:00, check at 17:00
    const monday5pm = makeDateForDay(1, 17, 0);
    expect(isClosingSoon(hours, monday5pm)).toBe(true);
  });

  test('returns false when more than 60 minutes from closing', () => {
    // Monday closes at 18:00, check at 12:00
    const mondayNoon = makeDateForDay(1, 12, 0);
    expect(isClosingSoon(hours, mondayNoon)).toBe(false);
  });

  test('returns false when cafe is closed', () => {
    const sunday12pm = makeDateForDay(0, 12, 0);
    expect(isClosingSoon(hours, sunday12pm)).toBe(false);
  });

  test('returns false before opening', () => {
    const monday6am = makeDateForDay(1, 6, 0);
    expect(isClosingSoon(hours, monday6am)).toBe(false);
  });
});

// ─── getMenuPreview ─────────────────────────────────────

describe('getMenuPreview', () => {
  test('empty categories → "Menu coming soon"', () => {
    expect(getMenuPreview([])).toBe('Menu coming soon');
  });

  test('single category', () => {
    expect(getMenuPreview(['espresso'])).toBe('Espresso');
  });

  test('three categories joined with commas', () => {
    const result = getMenuPreview(['espresso', 'brewed', 'cold']);
    expect(result).toBe('Espresso, Brewed, Cold');
  });

  test('more than 3 categories shows "+N more"', () => {
    const result = getMenuPreview(['espresso', 'brewed', 'cold', 'tea', 'food']);
    expect(result).toBe('Espresso, Brewed, Cold +2 more');
  });

  test('exactly 4 categories shows "+1 more"', () => {
    const result = getMenuPreview(['espresso', 'brewed', 'cold', 'tea']);
    expect(result).toBe('Espresso, Brewed, Cold +1 more');
  });

  test('capitalizes each category', () => {
    expect(getMenuPreview(['ESPRESSO'])).toBe('Espresso');
    expect(getMenuPreview(['specialty'])).toBe('Specialty');
  });
});

// ─── getAverageCreditPrice ──────────────────────────────

describe('getAverageCreditPrice', () => {
  test('empty array returns 0', () => {
    expect(getAverageCreditPrice([])).toBe(0);
  });

  test('single price returns that price', () => {
    expect(getAverageCreditPrice([3])).toBe(3);
  });

  test('averages and rounds', () => {
    expect(getAverageCreditPrice([2, 3])).toBe(3); // 2.5 → 3
  });

  test('even average', () => {
    expect(getAverageCreditPrice([2, 4])).toBe(3);
  });
});

// ─── getPriceTier ───────────────────────────────────────

describe('getPriceTier', () => {
  test('low price (1-3) → "$"', () => {
    expect(getPriceTier(1)).toBe('$');
    expect(getPriceTier(3)).toBe('$');
  });

  test('mid price (4-6) → "$$"', () => {
    expect(getPriceTier(4)).toBe('$$');
    expect(getPriceTier(6)).toBe('$$');
  });

  test('high price (7+) → "$$$"', () => {
    expect(getPriceTier(7)).toBe('$$$');
    expect(getPriceTier(10)).toBe('$$$');
  });

  test('zero → "$"', () => {
    expect(getPriceTier(0)).toBe('$');
  });
});

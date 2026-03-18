/**
 * Cafe Utility Functions
 *
 * Pure helpers for calculating distance, open/closed status,
 * and formatting cafe data for display.
 */

import type { DayHours, WeeklyHours, Cafe } from '@/models';
import type { LocationCoords } from '@/hooks/useLocation';

// ─── Distance Calculation ────────────────────────────────

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in miles.
 */
export function calculateDistance(
  from: LocationCoords,
  to: { latitude: number; longitude: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Open / Closed Status ────────────────────────────────

type DayOfWeek = keyof WeeklyHours;

const DAY_MAP: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/**
 * Determine if a cafe is currently open based on its hours.
 */
export function isCafeOpen(hours: WeeklyHours, now: Date = new Date()): boolean {
  const day = DAY_MAP[now.getDay()];
  const dayHours = hours[day];

  if (!dayHours || dayHours.closed) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(dayHours.open);
  const closeMinutes = parseTimeToMinutes(dayHours.close);

  // Handle overnight hours (e.g., open: 22:00, close: 02:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Check if cafe closes within the next 60 minutes.
 */
export function isClosingSoon(hours: WeeklyHours, now: Date = new Date()): boolean {
  const day = DAY_MAP[now.getDay()];
  const dayHours = hours[day];

  if (!dayHours || dayHours.closed) return false;
  if (!isCafeOpen(hours, now)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const closeMinutes = parseTimeToMinutes(dayHours.close);

  const minutesUntilClose = closeMinutes - currentMinutes;
  return minutesUntilClose > 0 && minutesUntilClose <= 60;
}

/**
 * Get today's hours as a formatted string.
 */
export function getTodayHoursString(hours: WeeklyHours, now: Date = new Date()): string {
  const day = DAY_MAP[now.getDay()];
  const dayHours = hours[day];

  if (!dayHours || dayHours.closed) return 'Closed today';

  return `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`;
}

/**
 * Get the full weekly schedule as an array for display.
 */
export function getWeeklySchedule(hours: WeeklyHours): Array<{
  day: string;
  hours: string;
  isToday: boolean;
}> {
  const today = DAY_MAP[new Date().getDay()];
  const dayLabels: Record<DayOfWeek, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  // Display order: Monday → Sunday
  const displayOrder: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  ];

  return displayOrder.map((day) => {
    const dh = hours[day];
    return {
      day: dayLabels[day],
      hours: !dh || dh.closed ? 'Closed' : `${formatTime(dh.open)} – ${formatTime(dh.close)}`,
      isToday: day === today,
    };
  });
}

// ─── Menu Helpers ────────────────────────────────────────

/**
 * Get a preview string of menu categories for a cafe card.
 */
export function getMenuPreview(categories: string[]): string {
  if (categories.length === 0) return 'Menu coming soon';
  const display = categories.slice(0, 3).map(capitalize);
  if (categories.length > 3) return `${display.join(', ')} +${categories.length - 3} more`;
  return display.join(', ');
}

/**
 * Get the average credit price for a set of menu items.
 */
export function getAverageCreditPrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  return Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
}

/**
 * Get price tier for filtering: '$' (1-3), '$$' (4-6), '$$$' (7+)
 */
export function getPriceTier(avgCreditPrice: number): '$' | '$$' | '$$$' {
  if (avgCreditPrice <= 3) return '$';
  if (avgCreditPrice <= 6) return '$$';
  return '$$$';
}

// ─── Private Helpers ─────────────────────────────────────

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m ? `${hour12}:${m.toString().padStart(2, '0')} ${period}` : `${hour12} ${period}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

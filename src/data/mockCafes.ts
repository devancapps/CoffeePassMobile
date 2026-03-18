/**
 * Mock Cafe Data
 *
 * Realistic sample data for development and testing.
 * 8 cafes around San Francisco with full details.
 * Used when Firebase is not connected.
 */

import { CafeStatus, MenuCategory } from '@/config/constants';
import type { Cafe, MenuItem, WeeklyHours } from '@/models';

// ─── Default Hours Templates ─────────────────────────────

const STANDARD_HOURS: WeeklyHours = {
  monday: { open: '06:30', close: '18:00', closed: false },
  tuesday: { open: '06:30', close: '18:00', closed: false },
  wednesday: { open: '06:30', close: '18:00', closed: false },
  thursday: { open: '06:30', close: '18:00', closed: false },
  friday: { open: '06:30', close: '19:00', closed: false },
  saturday: { open: '07:00', close: '19:00', closed: false },
  sunday: { open: '07:30', close: '17:00', closed: false },
};

const LATE_HOURS: WeeklyHours = {
  monday: { open: '07:00', close: '21:00', closed: false },
  tuesday: { open: '07:00', close: '21:00', closed: false },
  wednesday: { open: '07:00', close: '21:00', closed: false },
  thursday: { open: '07:00', close: '22:00', closed: false },
  friday: { open: '07:00', close: '22:00', closed: false },
  saturday: { open: '08:00', close: '22:00', closed: false },
  sunday: { open: '08:00', close: '20:00', closed: false },
};

const WEEKDAY_ONLY_HOURS: WeeklyHours = {
  monday: { open: '06:00', close: '16:00', closed: false },
  tuesday: { open: '06:00', close: '16:00', closed: false },
  wednesday: { open: '06:00', close: '16:00', closed: false },
  thursday: { open: '06:00', close: '16:00', closed: false },
  friday: { open: '06:00', close: '16:00', closed: false },
  saturday: { open: '08:00', close: '14:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
};

// ─── Mock Cafes ──────────────────────────────────────────

export const MOCK_CAFES: Cafe[] = [
  {
    id: 'cafe_001',
    ownerId: 'owner_001',
    name: 'The Daily Grind',
    description: 'Your neighborhood coffee spot since 2019. Specializing in single-origin pour-overs and house-made pastries. Free Wi-Fi and plenty of outlets for remote workers.',
    photoUrl: undefined,
    phone: '(415) 555-0101',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.12,
    address: {
      street: '742 Valencia St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      country: 'US',
    },
    location: {
      latitude: 37.7601,
      longitude: -122.4216,
      geohash: '9q8yyk',
    },
    hours: STANDARD_HOURS,
    menuItemCount: 12,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'cafe_002',
    ownerId: 'owner_002',
    name: 'Brew & Bean',
    description: 'Artisanal coffee roasted in-house daily. Our beans are sourced directly from farms in Colombia, Ethiopia, and Guatemala.',
    photoUrl: undefined,
    phone: '(415) 555-0102',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.12,
    address: {
      street: '1890 Bryant St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      country: 'US',
    },
    location: {
      latitude: 37.7635,
      longitude: -122.4098,
      geohash: '9q8yym',
    },
    hours: LATE_HOURS,
    menuItemCount: 15,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: 'cafe_003',
    ownerId: 'owner_003',
    name: 'Morning Pour',
    description: 'Cozy corner cafe with a passion for latte art. Home of the famous lavender honey latte.',
    photoUrl: undefined,
    phone: '(415) 555-0103',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.20,
    address: {
      street: '401 Hayes St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
    },
    location: {
      latitude: 37.7762,
      longitude: -122.4233,
      geohash: '9q8yyq',
    },
    hours: STANDARD_HOURS,
    menuItemCount: 8,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-10-20'),
  },
  {
    id: 'cafe_004',
    ownerId: 'owner_004',
    name: 'Foggy Roast',
    description: 'Dark roasts and fog-inspired drinks. Try our signature SF Fog cappuccino with oat milk and vanilla.',
    photoUrl: undefined,
    phone: '(415) 555-0104',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.12,
    address: {
      street: '2150 Irving St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94122',
      country: 'US',
    },
    location: {
      latitude: 37.7636,
      longitude: -122.4811,
      geohash: '9q8yv8',
    },
    hours: STANDARD_HOURS,
    menuItemCount: 10,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-09-15'),
  },
  {
    id: 'cafe_005',
    ownerId: 'owner_005',
    name: 'Pacific Perk',
    description: 'Ocean-view coffee with sustainably sourced beans. Our terrace is perfect for watching the sunset with an espresso.',
    photoUrl: undefined,
    phone: '(415) 555-0105',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.20,
    address: {
      street: '3800 Judah St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94122',
      country: 'US',
    },
    location: {
      latitude: 37.7605,
      longitude: -122.5065,
      geohash: '9q8yst',
    },
    hours: LATE_HOURS,
    menuItemCount: 9,
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-08-20'),
  },
  {
    id: 'cafe_006',
    ownerId: 'owner_006',
    name: 'The Coffee Lab',
    description: 'Experimental coffee shop where science meets flavor. We use precision extraction and unique brewing methods.',
    photoUrl: undefined,
    phone: '(415) 555-0106',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.12,
    address: {
      street: '560 4th St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'US',
    },
    location: {
      latitude: 37.7784,
      longitude: -122.3953,
      geohash: '9q8yzk',
    },
    hours: WEEKDAY_ONLY_HOURS,
    menuItemCount: 14,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-07-10'),
  },
  {
    id: 'cafe_007',
    ownerId: 'owner_007',
    name: 'Nob Hill Brews',
    description: 'Classic cafe atop Nob Hill with panoramic city views. Serving espresso, tea, and fresh-baked scones since 2020.',
    photoUrl: undefined,
    phone: '(415) 555-0107',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.20,
    address: {
      street: '1200 California St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94109',
      country: 'US',
    },
    location: {
      latitude: 37.7912,
      longitude: -122.4131,
      geohash: '9q8yyw',
    },
    hours: STANDARD_HOURS,
    menuItemCount: 7,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'cafe_008',
    ownerId: 'owner_008',
    name: 'Castro Coffee Co.',
    description: 'Vibrant community cafe in the heart of the Castro. Great music, friendly staff, and the best cold brew in town.',
    photoUrl: undefined,
    phone: '(415) 555-0108',
    status: CafeStatus.ACTIVE,
    platformFeeRate: 0.12,
    address: {
      street: '4075 18th St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94114',
      country: 'US',
    },
    location: {
      latitude: 37.7609,
      longitude: -122.4350,
      geohash: '9q8yyh',
    },
    hours: LATE_HOURS,
    menuItemCount: 11,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-11-30'),
  },
];

// ─── Mock Menu Items ─────────────────────────────────────

export const MOCK_MENU_ITEMS: Record<string, MenuItem[]> = {
  cafe_001: [
    { id: 'mi_001', cafeId: 'cafe_001', name: 'House Drip Coffee', description: 'Freshly brewed single-origin', creditPrice: 3, category: MenuCategory.BREWED, available: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_002', cafeId: 'cafe_001', name: 'Pour Over', description: 'Hand-poured to order', creditPrice: 5, category: MenuCategory.BREWED, available: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_003', cafeId: 'cafe_001', name: 'Classic Latte', description: 'Double shot with steamed milk', creditPrice: 5, category: MenuCategory.ESPRESSO, available: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_004', cafeId: 'cafe_001', name: 'Cappuccino', description: 'Equal parts espresso, steamed milk, foam', creditPrice: 5, category: MenuCategory.ESPRESSO, available: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_005', cafeId: 'cafe_001', name: 'Mocha', description: 'Espresso, chocolate, steamed milk, whipped cream', creditPrice: 6, category: MenuCategory.ESPRESSO, available: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_006', cafeId: 'cafe_001', name: 'Cold Brew', description: '24-hour cold-steeped concentrate', creditPrice: 5, category: MenuCategory.COLD, available: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_007', cafeId: 'cafe_001', name: 'Iced Americano', description: 'Double shot over ice', creditPrice: 4, category: MenuCategory.COLD, available: true, sortOrder: 7, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_008', cafeId: 'cafe_001', name: 'Matcha Latte', description: 'Ceremonial grade matcha with oat milk', creditPrice: 6, category: MenuCategory.TEA, available: true, sortOrder: 8, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_009', cafeId: 'cafe_001', name: 'Chai Latte', description: 'Spiced chai with steamed milk', creditPrice: 5, category: MenuCategory.TEA, available: true, sortOrder: 9, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_010', cafeId: 'cafe_001', name: 'Almond Croissant', description: 'Butter croissant with almond filling', creditPrice: 4, category: MenuCategory.FOOD, available: true, sortOrder: 10, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_011', cafeId: 'cafe_001', name: 'Banana Bread', description: 'House-baked with walnuts', creditPrice: 3, category: MenuCategory.FOOD, available: true, sortOrder: 11, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_012', cafeId: 'cafe_001', name: 'Avocado Toast', description: 'Sourdough, avocado, chili flakes, lime', creditPrice: 7, category: MenuCategory.FOOD, available: true, sortOrder: 12, createdAt: new Date(), updatedAt: new Date() },
  ],
  cafe_002: [
    { id: 'mi_020', cafeId: 'cafe_002', name: 'Ethiopian Pour Over', description: 'Fruity and floral single-origin', creditPrice: 6, category: MenuCategory.BREWED, available: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_021', cafeId: 'cafe_002', name: 'Cortado', description: 'Equal parts espresso and steamed milk', creditPrice: 4, category: MenuCategory.ESPRESSO, available: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_022', cafeId: 'cafe_002', name: 'Flat White', description: 'Ristretto shots with velvety microfoam', creditPrice: 5, category: MenuCategory.ESPRESSO, available: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_023', cafeId: 'cafe_002', name: 'Vanilla Latte', description: 'House-made vanilla syrup with double shot', creditPrice: 6, category: MenuCategory.ESPRESSO, available: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_024', cafeId: 'cafe_002', name: 'Nitro Cold Brew', description: 'Creamy nitrogen-infused cold brew', creditPrice: 6, category: MenuCategory.COLD, available: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_025', cafeId: 'cafe_002', name: 'Iced Matcha', description: 'Matcha over ice with oat milk', creditPrice: 6, category: MenuCategory.COLD, available: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_026', cafeId: 'cafe_002', name: 'London Fog', description: 'Earl Grey, vanilla, steamed milk', creditPrice: 5, category: MenuCategory.TEA, available: true, sortOrder: 7, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_027', cafeId: 'cafe_002', name: 'Morning Bun', description: 'Cinnamon-sugar pastry, warm from the oven', creditPrice: 4, category: MenuCategory.FOOD, available: true, sortOrder: 8, createdAt: new Date(), updatedAt: new Date() },
  ],
  cafe_003: [
    { id: 'mi_030', cafeId: 'cafe_003', name: 'Lavender Honey Latte', description: 'Our famous signature drink', creditPrice: 7, category: MenuCategory.SPECIALTY, available: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_031', cafeId: 'cafe_003', name: 'Rose Cardamom Latte', description: 'Floral and warming spices', creditPrice: 7, category: MenuCategory.SPECIALTY, available: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_032', cafeId: 'cafe_003', name: 'Classic Espresso', description: 'Double shot pulled to perfection', creditPrice: 3, category: MenuCategory.ESPRESSO, available: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_033', cafeId: 'cafe_003', name: 'Oat Milk Latte', description: 'Smooth and creamy with oat milk', creditPrice: 6, category: MenuCategory.ESPRESSO, available: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_034', cafeId: 'cafe_003', name: 'Cold Brew', description: 'Smooth and bold, 20-hour steep', creditPrice: 5, category: MenuCategory.COLD, available: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_035', cafeId: 'cafe_003', name: 'Jasmine Green Tea', description: 'Premium loose-leaf jasmine', creditPrice: 4, category: MenuCategory.TEA, available: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_036', cafeId: 'cafe_003', name: 'Scone of the Day', description: 'Rotating flavors, baked fresh', creditPrice: 4, category: MenuCategory.FOOD, available: true, sortOrder: 7, createdAt: new Date(), updatedAt: new Date() },
    { id: 'mi_037', cafeId: 'cafe_003', name: 'Granola Bowl', description: 'House granola, yogurt, seasonal fruit', creditPrice: 6, category: MenuCategory.FOOD, available: true, sortOrder: 8, createdAt: new Date(), updatedAt: new Date() },
  ],
};

// Generate menu items for remaining cafes with defaults
const DEFAULT_MENU: (cafeId: string) => MenuItem[] = (cafeId) => [
  { id: `${cafeId}_mi_1`, cafeId, name: 'House Coffee', description: 'Freshly brewed daily', creditPrice: 3, category: MenuCategory.BREWED, available: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: `${cafeId}_mi_2`, cafeId, name: 'Latte', description: 'Double shot with steamed milk', creditPrice: 5, category: MenuCategory.ESPRESSO, available: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: `${cafeId}_mi_3`, cafeId, name: 'Cappuccino', description: 'Classic Italian style', creditPrice: 5, category: MenuCategory.ESPRESSO, available: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: `${cafeId}_mi_4`, cafeId, name: 'Cold Brew', description: 'Slow-steeped for 24 hours', creditPrice: 5, category: MenuCategory.COLD, available: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: `${cafeId}_mi_5`, cafeId, name: 'Green Tea', description: 'Organic Japanese green tea', creditPrice: 4, category: MenuCategory.TEA, available: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: `${cafeId}_mi_6`, cafeId, name: 'Muffin', description: 'Baked fresh daily', creditPrice: 3, category: MenuCategory.FOOD, available: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
];

// Fill in remaining cafes
['cafe_004', 'cafe_005', 'cafe_006', 'cafe_007', 'cafe_008'].forEach((cafeId) => {
  if (!MOCK_MENU_ITEMS[cafeId]) {
    MOCK_MENU_ITEMS[cafeId] = DEFAULT_MENU(cafeId);
  }
});

/**
 * Get mock cafes, optionally filtered.
 */
export function getMockCafes(): Cafe[] {
  return MOCK_CAFES;
}

/**
 * Get mock menu items for a specific cafe.
 */
export function getMockMenuItems(cafeId: string): MenuItem[] {
  return MOCK_MENU_ITEMS[cafeId] ?? [];
}

/**
 * Get a single mock cafe by ID.
 */
export function getMockCafe(cafeId: string): Cafe | undefined {
  return MOCK_CAFES.find((c) => c.id === cafeId);
}

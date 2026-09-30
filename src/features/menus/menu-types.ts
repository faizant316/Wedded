import type { LocalizedText } from '@/i18n/localized';

// The shape useVendorMenus() returns (Tab A's hook, 2026-09-30).
export type DietTag =
  'veg' | 'non_veg' | 'jhatka' | 'halal' | 'jain' | 'eggless' | 'vegan' | 'gluten_free';

export const DIET_TAGS: DietTag[] = [
  'veg',
  'non_veg',
  'jhatka',
  'halal',
  'jain',
  'eggless',
  'vegan',
  'gluten_free',
];

export type MenuItem = { name: LocalizedText; description: string | null; dietTags: DietTag[] };

export type MenuSection = { name: LocalizedText; items: MenuItem[] };

export type Menu = {
  id: string;
  name: LocalizedText;
  description: LocalizedText | null;
  price: { amount: number; unit: 'person' | 'plate' | 'event' } | null;
  minGuests: number | null;
  cuisine: string | null;
  dietTags: DietTag[];
  sections: MenuSection[];
};

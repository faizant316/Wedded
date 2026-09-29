import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Display only: the categories themselves come from the database. A group
// that isn't listed here (a new one added later) gets the shop-front icon, so
// it never breaks a screen. No religious symbols as decoration (vision §4).
const GROUP_ICONS: Partial<Record<string, IoniconName>> = {
  venues: 'business-outline',
  food: 'restaurant-outline',
  music: 'musical-notes-outline',
  religious: 'flower-outline',
  'photo-video': 'camera-outline',
  decor: 'color-palette-outline',
  beauty: 'brush-outline',
  attire: 'shirt-outline',
  transport: 'car-outline',
  stationery: 'mail-outline',
  services: 'people-outline',
};

/** The icon for a category group slug (categories.group_slug). */
export function groupIcon(groupSlug: string): IoniconName {
  return GROUP_ICONS[groupSlug] ?? 'storefront-outline';
}

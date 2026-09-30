import { usd, type Translate } from '@/features/vendors/profile-format';

import type { Menu } from './menu-types';

/** "$45 / person", "$1,200 / event", or null when the vendor gave no price. */
export function menuPrice(menu: Pick<Menu, 'price'>, t: Translate): string | null {
  if (!menu.price) return null;
  return t('menus.price', {
    amount: usd.format(menu.price.amount),
    unit: t(`vendorCard.units.${menu.price.unit}`),
  });
}

/** "Min 150 guests", or null. */
export function menuMinimum(menu: Pick<Menu, 'minGuests'>, t: Translate): string | null {
  return menu.minGuests ? t('menus.minGuests', { count: menu.minGuests }) : null;
}

/**
 * The cheapest per-guest menu, for Compare's "Menus from $X": per person or
 * plate only (a flat event price isn't comparable), or null.
 */
export function cheapestPerGuest(menus: Pick<Menu, 'price'>[]): number | null {
  const amounts = menus
    .map((menu) => menu.price)
    .filter((price) => price !== null && price.unit !== 'event')
    .map((price) => price!.amount);
  return amounts.length > 0 ? Math.min(...amounts) : null;
}

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

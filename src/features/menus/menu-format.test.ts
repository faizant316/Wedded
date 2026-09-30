import { menuMinimum, menuPrice } from './menu-format';

const t = (key: string, options?: Record<string, string | number>) =>
  `${key}${options ? JSON.stringify(options) : ''}`;

describe('menuPrice', () => {
  it('formats the amount and the unit word', () => {
    expect(menuPrice({ price: { amount: 45, unit: 'person' } }, t)).toBe(
      'menus.price{"amount":"$45","unit":"vendorCard.units.person"}',
    );
  });

  it('is null without a price', () => {
    expect(menuPrice({ price: null }, t)).toBeNull();
  });
});

describe('menuMinimum', () => {
  it('shows the minimum guest count, or nothing', () => {
    expect(menuMinimum({ minGuests: 150 }, t)).toBe('menus.minGuests{"count":150}');
    expect(menuMinimum({ minGuests: null }, t)).toBeNull();
  });
});

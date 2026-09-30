import { cheapestPerGuest, menuMinimum, menuPrice } from './menu-format';

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

describe('cheapestPerGuest', () => {
  it('takes the lowest per person or per plate price and skips flat event prices', () => {
    expect(
      cheapestPerGuest([
        { price: { amount: 55, unit: 'plate' } },
        { price: { amount: 38, unit: 'person' } },
        { price: { amount: 900, unit: 'event' } },
        { price: null },
      ]),
    ).toBe(38);
  });

  it('is null when nothing is priced per guest', () => {
    expect(
      cheapestPerGuest([{ price: { amount: 900, unit: 'event' } }, { price: null }]),
    ).toBeNull();
  });
});

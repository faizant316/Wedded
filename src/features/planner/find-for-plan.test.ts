import { filtersForGuests } from './find-for-plan';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

describe('filtersForGuests', () => {
  it('asks venues to seat everyone', () => {
    expect(filtersForGuests('venues', '100_250')).toEqual({ minGuests: 250 });
    expect(filtersForGuests('venues', '500_plus')).toEqual({ minGuests: 600 });
  });

  it('shows the lowest prices first for a small event', () => {
    expect(filtersForGuests('music', 'under_50')).toEqual({ sort: 'price_low' });
    expect(filtersForGuests('food', '50_100')).toEqual({ sort: 'price_low' });
  });

  it('changes nothing for bigger events, unsure or no count', () => {
    expect(filtersForGuests('music', '250_500')).toEqual({});
    expect(filtersForGuests('venues', 'not_sure')).toEqual({});
    expect(filtersForGuests('venues', null)).toEqual({});
  });
});

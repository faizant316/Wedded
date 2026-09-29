import { factLabels, formatTime, priceLine } from './profile-format';

// Echo the key and values, so tests check the logic rather than the wording.
const t = (key: string, options?: Record<string, string | number>) =>
  options ? `${key} ${JSON.stringify(options)}` : key;

describe('priceLine', () => {
  it('shows a starting price with its unit, Latin digits and no cents', () => {
    expect(priceLine({ kind: 'starting_at', amount: 1500, unit: 'event' }, t)).toBe(
      'vendorCard.fromPer {"price":"$1,500","unit":"vendorCard.units.event"}',
    );
  });

  it('shows a starting price without a unit', () => {
    expect(priceLine({ kind: 'starting_at', amount: 55 }, t)).toBe(
      'vendorCard.from {"price":"$55"}',
    );
  });

  it('shows a range', () => {
    expect(priceLine({ kind: 'range', from: 4000, to: 9000, unit: 'event' }, t)).toBe(
      'vendor.priceRangePer {"from":"$4,000","to":"$9,000","unit":"vendorCard.units.event"}',
    );
  });

  it('never shows a number for packages or contact', () => {
    expect(priceLine({ kind: 'packages' }, t)).toBe('vendor.pricePackages');
    expect(priceLine({ kind: 'contact' }, t)).toBe('vendor.priceContact');
  });
});

describe('formatTime', () => {
  it.each([
    ['01:00', '1:00 AM'],
    ['00:30', '12:30 AM'],
    ['12:00', '12:00 PM'],
    ['23:45', '11:45 PM'],
  ])('%s becomes %s', (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });

  it('leaves anything unexpected as it was', () => {
    expect(formatTime('late')).toBe('late');
  });
});

describe('factLabels', () => {
  it('turns hall details into chips, in a fixed order', () => {
    expect(
      factLabels(
        {
          seatedCapacity: 700,
          outsideCatering: 'approved_list',
          alcoholPolicy: 'byob',
          corkage: 500,
          ghoriAllowed: true,
          curfew: '01:00',
          parkingSpaces: 400,
        },
        t,
      ),
    ).toEqual([
      'vendor.facts.seats {"count":700}',
      'vendor.facts.outsideCateringList',
      'vendor.facts.byobCorkage {"price":"$500"}',
      'vendor.facts.ghoriYes',
      'vendor.facts.curfew {"time":"1:00 AM"}',
      'vendor.facts.parking {"count":400}',
    ]);
  });

  it('shows "no ghori" rather than nothing when a hall says no', () => {
    expect(factLabels({ ghoriAllowed: false }, t)).toEqual(['vendor.facts.ghoriNo']);
  });

  it('skips values the app does not know and empty details', () => {
    expect(factLabels({ outsideCatering: 'sometimes', alcoholPolicy: 'dry-ish' }, t)).toEqual([]);
    expect(factLabels({}, t)).toEqual([]);
  });
});

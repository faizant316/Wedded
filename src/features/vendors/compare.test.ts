import type { VendorProfile } from '@/data/vendors';

import { compareRows } from './compare';

const t = (key: string, options?: Record<string, string | number>) =>
  options ? `${key} ${JSON.stringify(options)}` : key;

function vendor(overrides: Partial<VendorProfile>): VendorProfile {
  return {
    id: 'v',
    slug: 'v',
    name: { en: 'V' },
    tagline: { en: null, pa: null },
    bio: { en: null, pa: null },
    city: 'Yuba City',
    addressLine: null,
    serviceRadiusMiles: 25,
    willTravel: false,
    travelNote: null,
    callPhone: null,
    textPhone: null,
    whatsappPhone: null,
    instagramHandle: null,
    websiteUrl: null,
    languages: [],
    price: null,
    priceNote: null,
    foundingNumber: null,
    facts: {},
    categories: [],
    ...overrides,
  };
}

describe('compareRows', () => {
  it('compares halls on seats, catering and alcohol, with a blank where one says nothing', () => {
    const rows = compareRows(
      [
        vendor({
          facts: {
            seatedCapacity: 700,
            outsideCatering: 'approved_list',
            alcoholPolicy: 'byob',
            corkage: 500,
          },
        }),
        vendor({ facts: { seatedCapacity: 450, outsideCatering: 'yes' } }),
      ],
      t,
    );
    const seats = rows.find((r) => r.key === 'seats');
    expect(seats?.values).toEqual([
      'vendor.facts.seats {"count":700}',
      'vendor.facts.seats {"count":450}',
    ]);
    expect(rows.find((r) => r.key === 'alcohol')?.values[1]).toBeNull();
  });

  it('leaves out rows where nobody has anything, so DJs get no hall rows', () => {
    const keys = compareRows([vendor({}), vendor({ languages: ['pa'] })], t).map((r) => r.key);
    expect(keys).not.toContain('seats');
    expect(keys).not.toContain('curfew');
    expect(keys).toContain('languages');
    expect(keys).toContain('where');
  });

  it('adds the trust numbers when there are enough', () => {
    const rows = compareRows([vendor({}), vendor({})], t, [
      { savedBy: 12, replied: { replied: 9, answered: 11 } },
      { savedBy: null, replied: null },
    ]);
    expect(rows.find((r) => r.key === 'saved')?.values).toEqual([
      'vendorStats.savedBy {"count":12}',
      null,
    ]);
  });
});

import type { Tradition } from '@/data/reference';

import { traditionsForSearch } from './plan-traditions';

const culture = (slug: string, background: string | null, faith: string | null): Tradition => ({
  slug,
  name: { en: slug },
  isDefault: slug === 'punjabi-sikh',
  backgroundSlug: background,
  faithSlug: faith,
  events: [],
});
const all = [
  culture('punjabi-sikh', 'punjabi', 'sikh'),
  culture('punjabi-hindu', 'punjabi', 'hindu'),
  culture('pakistani', 'pakistani', 'muslim'),
  culture('muslim', null, 'muslim'),
  culture('arab', 'arab', 'muslim'),
];
const slugs = (b: string[], f: string[]) => traditionsForSearch(b, f, all).map((t) => t.slug);

describe('traditionsForSearch', () => {
  it('matches a place and a faith together', () => {
    expect(slugs(['pakistani'], ['muslim'])).toEqual(['pakistani']);
    expect(slugs(['punjabi'], ['hindu'])).toEqual(['punjabi-hindu']);
  });

  it('handles a mixed wedding', () => {
    expect(slugs(['punjabi', 'pakistani'], ['sikh', 'muslim'])).toEqual([
      'punjabi-sikh',
      'pakistani',
    ]);
  });

  it('uses the faith-wide tradition when the place has none', () => {
    expect(slugs(['afghan'], ['muslim'])).toEqual(['muslim']);
    expect(slugs(['punjabi'], ['muslim'])).toEqual(['muslim']);
  });

  it("uses a place's traditions when no faith is named", () => {
    expect(slugs(['punjabi'], [])).toEqual(['punjabi-sikh', 'punjabi-hindu']);
  });

  it('falls back to the faith, then the place', () => {
    expect(slugs(['indian'], ['hindu'])).toEqual(['punjabi-hindu']);
    expect(slugs(['arab'], ['christian'])).toEqual(['arab']);
  });

  it('leaves the choice to the family when nothing matches', () => {
    expect(slugs([], [])).toEqual([]);
    expect(slugs(['bangladeshi'], [])).toEqual([]);
  });
});

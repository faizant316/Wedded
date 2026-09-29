import en from '@/i18n/en.json';
import pa from '@/i18n/pa.json';

import {
  eventChips,
  formatDate,
  fromDateString,
  suggestedMessage,
  toDateString,
} from './inquiry-helpers';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

/** The app's own strings, with {{name}} filled in, like useLocale().t. */
function translator(strings: Record<string, unknown>) {
  return (key: string, options: Record<string, string | number> = {}) => {
    const value = key
      .split('.')
      .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], strings);
    if (typeof value !== 'string') throw new Error(`Missing string ${key}`);
    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(options[name] ?? ''));
  };
}

describe('dates', () => {
  it('keeps the calendar day the phone picked, with no time zone shift', () => {
    const picked = new Date(2027, 5, 13, 23, 30); // late evening, local time
    expect(toDateString(picked)).toBe('2027-06-13');
    expect(toDateString(fromDateString('2027-06-13'))).toBe('2027-06-13');
  });

  it('shows dates with Latin digits', () => {
    expect(formatDate('2027-06-13')).toBe('Sun, Jun 13, 2027');
  });
});

describe('suggestedMessage', () => {
  const events = [{ en: 'Jaago', pa: 'ਜਾਗੋ' }];

  it('writes the full sentence when date and guests are known', () => {
    expect(
      suggestedMessage(translator(en), 'en', {
        events,
        date: '2027-06-12',
        place: 'Yuba City',
        guests: '100_250',
      }),
    ).toBe(
      "Sat Sri Akal, we're planning Jaago on Sat, Jun 12, 2027 in Yuba City for about 100 to 250 guests. Could you share your price and whether you're available? Thank you.",
    );
  });

  it('leaves out what they are not sure of', () => {
    expect(
      suggestedMessage(translator(en), 'en', {
        events: [],
        date: null,
        place: '',
        guests: 'not_sure',
      }),
    ).toBe(
      "Sat Sri Akal, we're planning a wedding in our city. Could you share your price? Thank you.",
    );
  });

  it('asks to visit for a tour', () => {
    expect(
      suggestedMessage(translator(en), 'en', {
        events: [{ en: 'Reception' }],
        date: '2027-06-13',
        place: 'Yuba City',
        guests: '500_plus',
        tour: true,
      }),
    ).toContain('would like to visit your hall');
  });

  it('writes in Punjabi with the Gurmukhi event name', () => {
    const message = suggestedMessage(translator(pa), 'pa', {
      events,
      date: null,
      place: 'Yuba City',
      guests: null,
    });
    expect(message).toContain('ਜਾਗੋ');
    expect(message.startsWith('ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ')).toBe(true);
  });
});

describe('eventChips', () => {
  const all = ['roka', 'jaago', 'anand-karaj', 'reception', 'sangeet'].map((slug) => ({ slug }));
  const slugs = (result: { shown: { slug: string }[] }) => result.shown.map((e) => e.slug);

  it('puts the event they came from first, then the vendor’s events', () => {
    const result = eventChips(all, ['reception'], ['jaago', 'reception', 'sangeet'], false);
    expect(slugs(result)).toEqual(['reception', 'jaago', 'sangeet']);
    expect(result.hasMore).toBe(true);
  });

  it('shows every event once expanded', () => {
    const result = eventChips(all, ['reception'], ['jaago'], true);
    expect(slugs(result)).toEqual(['roka', 'jaago', 'anand-karaj', 'reception', 'sangeet']);
    expect(result.hasMore).toBe(false);
  });

  it('shows every event when there is nothing to put first', () => {
    const result = eventChips(all, [], [], false);
    expect(result.shown).toHaveLength(5);
    expect(result.hasMore).toBe(false);
  });

  it('has no "Other events" when the vendor serves them all', () => {
    const result = eventChips(
      all,
      [],
      all.map((e) => e.slug),
      false,
    );
    expect(result.hasMore).toBe(false);
  });
});

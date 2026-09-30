import { monthRange, scorecardMessage } from './founders-report';

describe('monthRange', () => {
  it('covers the whole month', () => {
    expect(monthRange('2026-02')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
      label: 'February 2026',
    });
    expect(monthRange('2028-02').to).toBe('2028-02-29');
  });
});

describe('scorecardMessage', () => {
  const base = {
    views: 340,
    calls: 12,
    texts: 7,
    whatsapps: 3,
    directions: 9,
    shares: 4,
    saves: 40,
    inquiries: 9,
    replied: 8,
    answered: 9,
  };

  it('reads like a message to the vendor', () => {
    const text = scorecardMessage('Sunrise Palace', 'October 2026', base);
    expect(text).toContain('Sunrise Palace: your Wedded App numbers for October 2026');
    expect(text).toContain('340 families viewed your page');
    expect(text).toContain('22 tapped to call, text or WhatsApp you');
    expect(text).toContain('8 of 9 families who told us say you replied');
    expect(text).not.toContain('Tip:');
  });

  it('adds a tip instead of a bad number for quiet months', () => {
    const text = scorecardMessage('Quiet DJ', 'October 2026', { ...base, views: 5, answered: 0 });
    expect(text).toContain('Tip:');
    expect(text).not.toContain('say you replied');
  });
});

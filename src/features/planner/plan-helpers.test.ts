import { bookedCount, daysUntil } from './plan-helpers';

describe('daysUntil', () => {
  const today = new Date(2026, 8, 30); // 30 September 2026, local time

  it('counts whole days to a future date', () => {
    expect(daysUntil('2026-10-01', today)).toBe(1);
    expect(daysUntil('2027-06-13', today)).toBe(256);
  });

  it('is zero on the day and negative after', () => {
    expect(daysUntil('2026-09-30', today)).toBe(0);
    expect(daysUntil('2026-09-28', today)).toBe(-2);
  });
});

describe('bookedCount', () => {
  it('adds up booked types for the events in the plan only', () => {
    expect(
      bookedCount({
        weddingDate: null,
        events: ['jaago', 'reception'],
        booked: { jaago: ['dhol', 'caterer'], reception: ['dj'], mehndi: ['mehndi-artist'] },
      }),
    ).toBe(3);
  });
});

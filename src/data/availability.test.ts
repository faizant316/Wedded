import { asDateStatus } from './availability';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

describe('asDateStatus', () => {
  it('keeps known statuses and treats anything else as unknown', () => {
    expect(asDateStatus('booked')).toBe('booked');
    expect(asDateStatus('open')).toBe('open');
    expect(asDateStatus('maybe')).toBe('unknown');
    expect(asDateStatus(null)).toBe('unknown');
  });
});

import { formatPhone } from './phone';

describe('formatPhone', () => {
  it('shows US and Canada numbers the familiar way', () => {
    expect(formatPhone('+15305550101')).toBe('(530) 555-0101');
  });

  it('leaves other countries in + form', () => {
    expect(formatPhone('+919876543210')).toBe('+919876543210');
    expect(formatPhone('+447911123456')).toBe('+447911123456');
  });
});

import { parseDates } from './set-availability';

jest.mock('./connect', () => ({
  connect: jest.fn(),
  fail: (message: string) => {
    throw new Error(message);
  },
}));

describe('parseDates', () => {
  it('reads a comma list', () => {
    expect(parseDates('2027-06-12, 2027-06-13', '--booked')).toEqual(['2027-06-12', '2027-06-13']);
    expect(parseDates(undefined, '--booked')).toEqual([]);
  });

  it('refuses dates that are not real', () => {
    expect(() => parseDates('2027-02-30', '--booked')).toThrow('not a date');
    expect(() => parseDates('June 12', '--held')).toThrow('--held');
  });
});

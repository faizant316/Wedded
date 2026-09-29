import { vendorQuery } from './vendor-query';

describe('vendorQuery', () => {
  it('trims and collapses spaces', () => {
    expect(vendorQuery('  royal   orchard ')).toBe('royal orchard');
  });

  it('waits for at least two characters', () => {
    expect(vendorQuery('')).toBeNull();
    expect(vendorQuery('  r ')).toBeNull();
    expect(vendorQuery('ro')).toBe('ro');
  });

  it('turns LIKE wildcards into spaces', () => {
    expect(vendorQuery('%')).toBeNull();
    expect(vendorQuery('dj_sam%')).toBe('dj sam');
    expect(vendorQuery('a\\b')).toBe('a b');
  });

  it('counts Gurmukhi by code point', () => {
    expect(vendorQuery('ਢ')).toBeNull();
    expect(vendorQuery('ਢੋਲ')).toBe('ਢੋਲ');
  });
});

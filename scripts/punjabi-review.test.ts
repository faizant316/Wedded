import { toCsv } from './punjabi-review';

describe('toCsv', () => {
  const csv = toCsv([
    { section: 'Events', where: 'jaago (name)', english: 'Jaago', punjabi: 'ਜਾਗੋ' },
    { section: 'Events', where: 'jaago (timing)', english: 'Night before, "late"', punjabi: '' },
    { section: 'App text', where: 'home.title', english: 'Home', punjabi: 'ਘਰ' },
  ]);
  const lines = csv.split('\n');

  it('starts with a byte-order mark so Excel reads Gurmukhi', () => {
    expect(csv.startsWith('﻿Section,Where,English')).toBe(true);
  });

  it('puts missing Punjabi first within a section and marks it', () => {
    expect(lines[1]).toBe('Events,jaago (timing),"Night before, ""late""",,yes,,');
    expect(lines[2]).toBe('Events,jaago (name),Jaago,ਜਾਗੋ,,,');
    expect(lines[3]).toBe('App text,home.title,Home,ਘਰ,,,');
  });
});

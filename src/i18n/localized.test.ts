import { asLocalizedText, bilingual, localized, vendorText } from './localized';

describe('localized', () => {
  it('uses Punjabi in Punjabi mode and falls back to English', () => {
    expect(localized({ en: 'Jaago', pa: 'ਜਾਗੋ' }, 'pa')).toBe('ਜਾਗੋ');
    expect(localized({ en: 'Jaago', pa: 'ਜਾਗੋ' }, 'en')).toBe('Jaago');
    expect(localized({ en: 'Drone' }, 'pa')).toBe('Drone');
    expect(localized({ en: 'Drone', pa: '  ' }, 'pa')).toBe('Drone');
  });
});

describe('bilingual', () => {
  it('puts the app language first and the other script second', () => {
    expect(bilingual({ en: 'Jaago', pa: 'ਜਾਗੋ' }, 'en')).toEqual({
      primary: { text: 'Jaago', lang: 'en' },
      secondary: { text: 'ਜਾਗੋ', lang: 'pa' },
    });
    expect(bilingual({ en: 'Jaago', pa: 'ਜਾਗੋ' }, 'pa')).toEqual({
      primary: { text: 'ਜਾਗੋ', lang: 'pa' },
      secondary: { text: 'Jaago', lang: 'en' },
    });
  });

  it('shows one English line until Punjabi exists', () => {
    expect(bilingual({ en: 'Drone' }, 'pa')).toEqual({ primary: { text: 'Drone', lang: 'en' } });
  });
});

describe('vendorText', () => {
  it('prefers the app language', () => {
    expect(vendorText('Hello', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'pa')).toBe('ਸਤ ਸ੍ਰੀ ਅਕਾਲ');
    expect(vendorText('Hello', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'en')).toBe('Hello');
  });

  it('shows a Punjabi-only bio in both modes', () => {
    expect(vendorText(null, 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'en')).toBe('ਸਤ ਸ੍ਰੀ ਅਕਾਲ');
  });

  it('returns null when neither exists', () => {
    expect(vendorText(null, '  ', 'en')).toBeNull();
  });
});

describe('asLocalizedText', () => {
  it('reads a database name', () => {
    expect(asLocalizedText({ en: 'Jaago', pa: 'ਜਾਗੋ' })).toEqual({ en: 'Jaago', pa: 'ਜਾਗੋ' });
    expect(asLocalizedText({ en: 'Drone' })).toEqual({ en: 'Drone' });
  });

  it('returns null for anything else', () => {
    expect(asLocalizedText(null)).toBeNull();
    expect(asLocalizedText('Jaago')).toBeNull();
    expect(asLocalizedText(['Jaago'])).toBeNull();
    expect(asLocalizedText({ pa: 'ਜਾਗੋ' })).toBeNull();
  });
});

import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './en.json';
import pa from './pa.json';

export const SUPPORTED_LOCALES = ['en', 'pa'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const i18n = new I18n({ en, pa });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Punjabi if the phone is set to it, otherwise English. */
export function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return code === 'pa' ? 'pa' : 'en';
}

const GURMUKHI = /[਀-੿]/;

/** True when a string contains any Gurmukhi character. */
export function hasGurmukhi(text: string): boolean {
  return GURMUKHI.test(text);
}

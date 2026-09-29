import type { Locale } from './index';

/**
 * A name or label that comes from the database (events, categories, and so on)
 * in both languages. English is always present; Punjabi is optional until
 * someone has written it.
 */
export type LocalizedText = { en: string; pa?: string };

/** The text in the given language, falling back to English when Punjabi is missing or blank. */
export function localized(text: LocalizedText, locale: Locale): string {
  if (locale === 'pa' && text.pa?.trim()) {
    return text.pa;
  }
  return text.en;
}

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

export type LocalizedLine = { text: string; lang: Locale };

/**
 * Both scripts for a two-line label: the app language on top, the other one
 * underneath ("Jaago" over "ਜਾਗੋ", reversed in Punjabi mode). No second line
 * when there's no Punjabi yet. Pass `lang` to AppText so each line gets its
 * own font.
 */
export function bilingual(
  text: LocalizedText,
  locale: Locale,
): { primary: LocalizedLine; secondary?: LocalizedLine } {
  const pa = text.pa?.trim() ? text.pa : undefined;
  if (!pa) {
    return { primary: { text: text.en, lang: 'en' } };
  }
  const en: LocalizedLine = { text: text.en, lang: 'en' };
  const gurmukhi: LocalizedLine = { text: pa, lang: 'pa' };
  return locale === 'pa'
    ? { primary: gurmukhi, secondary: en }
    : { primary: en, secondary: gurmukhi };
}

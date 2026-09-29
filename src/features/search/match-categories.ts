import type { LocalizedText } from '@/i18n/localized';

type Searchable = { name: LocalizedText; aliases: string[] };

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** 0 is the best match; null means no match. */
function score(term: string, query: string): number | null {
  if (term === query) return 0;
  if (term.startsWith(query)) return 1;
  if (term.split(/[\s/,+()-]+/).some((word) => word.startsWith(query))) return 2;
  if (term.includes(query)) return 3;
  return null;
}

/**
 * Categories whose English name, Punjabi name or aliases match what was typed,
 * best matches first: exact, then starts with, then a word that starts with,
 * then contains. Works for Gurmukhi (the aliases include ਢੋਲ, ਮਹਿੰਦੀ and so on)
 * and ignores case and extra spaces. Empty text matches nothing.
 */
export function matchCategories<T extends Searchable>(categories: T[], text: string): T[] {
  const query = normalize(text);
  if (!query) return [];

  const scored: { category: T; best: number }[] = [];
  for (const category of categories) {
    const terms = [category.name.en, category.name.pa ?? '', ...category.aliases]
      .map(normalize)
      .filter(Boolean);
    let best: number | null = null;
    for (const term of terms) {
      const s = score(term, query);
      if (s !== null && (best === null || s < best)) best = s;
    }
    if (best !== null) scored.push({ category, best });
  }
  return scored
    .sort((a, b) => a.best - b.best || a.category.name.en.localeCompare(b.category.name.en, 'en'))
    .map(({ category }) => category);
}

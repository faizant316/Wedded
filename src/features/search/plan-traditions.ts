import type { Tradition } from '@/data/reference';

/**
 * The kinds of wedding a search points to, from the places and faiths it
 * names ("punjabi sikh wedding", "pakistani shadi"), for the "What kind of
 * wedding?" question to start ticked. In order:
 * 1. traditions matching both a place and a faith named (Pakistani + Muslim
 *    is the Pakistani tradition);
 * 2. for a named faith nothing matched yet, its faith-wide tradition (Afghan
 *    + Muslim finds Muslim);
 * 3. for a named place nothing matched yet, and no faith named, that place's
 *    traditions (Punjabi alone finds Punjabi Sikh and Hindu);
 * 4. still nothing: any tradition of a named faith, then any of a named place.
 * Nothing named, or nothing that matches, gives none: the family picks.
 */
export function traditionsForSearch(
  backgrounds: string[],
  faiths: string[],
  traditions: Tradition[],
): Tradition[] {
  const picked = new Set<Tradition>();
  for (const t of traditions) {
    if (t.backgroundSlug && t.faithSlug) {
      if (backgrounds.includes(t.backgroundSlug) && faiths.includes(t.faithSlug)) picked.add(t);
    }
  }
  const matchedFaiths = new Set([...picked].map((t) => t.faithSlug));
  const matchedBackgrounds = new Set([...picked].map((t) => t.backgroundSlug));
  for (const t of traditions) {
    if (!t.backgroundSlug && t.faithSlug && faiths.includes(t.faithSlug)) {
      if (!matchedFaiths.has(t.faithSlug)) picked.add(t);
    }
    if (faiths.length === 0 && t.backgroundSlug && backgrounds.includes(t.backgroundSlug)) {
      if (!matchedBackgrounds.has(t.backgroundSlug)) picked.add(t);
    }
  }
  if (picked.size === 0) {
    for (const t of traditions) if (t.faithSlug && faiths.includes(t.faithSlug)) picked.add(t);
  }
  if (picked.size === 0) {
    for (const t of traditions) {
      if (t.backgroundSlug && backgrounds.includes(t.backgroundSlug)) picked.add(t);
    }
  }
  return traditions.filter((t) => picked.has(t));
}

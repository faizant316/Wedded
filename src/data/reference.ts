/**
 * Reference data hooks: events, what each event needs, and categories.
 * These tables change only when the founders edit them, so the results stay
 * fresh for a day. Every name comes back as LocalizedText; show it with
 * localized() or bilingual(). Nothing here is hardcoded: order and grouping
 * come from the database (docs/PRODUCT_VISION.md section 3).
 */
import { useQuery } from '@tanstack/react-query';

import { asLocalizedText, type LocalizedText } from '@/i18n/localized';
import { supabase } from '@/lib/supabase';

const DAY = 24 * 60 * 60 * 1000;
const REFERENCE = { staleTime: DAY, gcTime: DAY } as const;

export const referenceKeys = {
  all: ['reference'] as const,
  homeEvents: () => [...referenceKeys.all, 'home-events'] as const,
  event: (slug: string) => [...referenceKeys.all, 'event', slug] as const,
  eventNeeds: (slug: string) => [...referenceKeys.all, 'event-needs', slug] as const,
  categories: () => [...referenceKeys.all, 'categories'] as const,
};

/** The row's name, or its slug if the name is somehow unreadable. */
function nameOf(row: { slug: string; name: unknown }): LocalizedText {
  return asLocalizedText(row.name) ?? { en: row.slug };
}

// Home -------------------------------------------------------------------

export type HomeEvent = {
  slug: string;
  name: LocalizedText;
  /** How many kinds of vendor the event needs. */
  vendorTypeCount: number;
  /** Published vendors who serve it. */
  vendorCount: number;
};

/** `phase` is before, wedding_day, after or whole_wedding. */
export type HomeSection = { phase: string; events: HomeEvent[] };

async function fetchHomeEvents(): Promise<HomeSection[]> {
  const { data, error } = await supabase
    .from('culture_events')
    .select(
      'phase, sort_order, culture:cultures!inner(is_default), event:events!inner(slug, name, event_categories(count), vendor_events(count))',
    )
    .eq('culture.is_default', true)
    .order('sort_order');
  if (error) throw error;

  // Rows arrive in ceremony order, so sections appear in the order of their
  // first event and events keep their order within each section.
  const sections: HomeSection[] = [];
  for (const row of data) {
    let section = sections.find((s) => s.phase === row.phase);
    if (!section) {
      section = { phase: row.phase, events: [] };
      sections.push(section);
    }
    section.events.push({
      slug: row.event.slug,
      name: nameOf(row.event),
      vendorTypeCount: row.event.event_categories[0]?.count ?? 0,
      vendorCount: row.event.vendor_events[0]?.count ?? 0,
    });
  }
  return sections;
}

/** The default culture's events for Home, grouped by phase, in ceremony order. */
export function useHomeEvents() {
  return useQuery({ queryKey: referenceKeys.homeEvents(), queryFn: fetchHomeEvents, ...REFERENCE });
}

// Event page -------------------------------------------------------------

export type EventDetails = {
  slug: string;
  name: LocalizedText;
  /** When it usually happens, e.g. "The night before the wedding". */
  timing: LocalizedText | null;
  /** The founders' two-line explainer; null until written. */
  summary: LocalizedText | null;
};

async function fetchEvent(slug: string): Promise<EventDetails | null> {
  const { data, error } = await supabase
    .from('events')
    .select('slug, name, timing, summary')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    slug: data.slug,
    name: nameOf(data),
    timing: asLocalizedText(data.timing),
    summary: asLocalizedText(data.summary),
  };
}

/** One event, or null when no event has that slug (show "not found"). */
export function useEvent(slug: string) {
  return useQuery({
    queryKey: referenceKeys.event(slug),
    queryFn: () => fetchEvent(slug),
    enabled: slug.length > 0,
    ...REFERENCE,
  });
}

export type EventNeed = {
  categorySlug: string;
  name: LocalizedText;
  /** For the display-only group icon. */
  groupSlug: string;
};

/** `importance` is essential or nice_to_have. */
export type EventNeedsSection = { importance: string; needs: EventNeed[] };

const IMPORTANCE_ORDER = ['essential', 'nice_to_have'];

async function fetchEventNeeds(slug: string): Promise<EventNeedsSection[]> {
  const { data, error } = await supabase
    .from('event_categories')
    .select('importance, sort_order, category:categories!inner(slug, name, group_slug)')
    .eq('event_slug', slug)
    .order('sort_order');
  if (error) throw error;

  const sections: EventNeedsSection[] = [];
  for (const row of data) {
    let section = sections.find((s) => s.importance === row.importance);
    if (!section) {
      section = { importance: row.importance, needs: [] };
      sections.push(section);
    }
    section.needs.push({
      categorySlug: row.category.slug,
      name: nameOf(row.category),
      groupSlug: row.category.group_slug,
    });
  }
  // Essential first, then nice to have; anything new goes last.
  const rank = (importance: string) => {
    const index = IMPORTANCE_ORDER.indexOf(importance);
    return index === -1 ? IMPORTANCE_ORDER.length : index;
  };
  return sections.sort((a, b) => rank(a.importance) - rank(b.importance));
}

/** The vendor categories an event needs: essential first, then nice to have. */
export function useEventNeeds(slug: string) {
  return useQuery({
    queryKey: referenceKeys.eventNeeds(slug),
    queryFn: () => fetchEventNeeds(slug),
    enabled: slug.length > 0,
    ...REFERENCE,
  });
}

// Search -----------------------------------------------------------------

export type Category = {
  slug: string;
  name: LocalizedText;
  /** Other spellings and names, in English and Gurmukhi, for matching search text. */
  aliases: string[];
  groupSlug: string;
};

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, name, aliases, group_slug');
  if (error) throw error;
  return data
    .map((row) => ({
      slug: row.slug,
      name: nameOf(row),
      aliases: row.aliases,
      groupSlug: row.group_slug,
    }))
    .sort((a, b) => a.name.en.localeCompare(b.name.en, 'en'));
}

/** Every category, A to Z by English name. */
export function useCategories() {
  return useQuery({ queryKey: referenceKeys.categories(), queryFn: fetchCategories, ...REFERENCE });
}

// Browse by vendor type ----------------------------------------------------

export type CategoryGroup = {
  slug: string;
  name: LocalizedText;
  /** In the founders' order within the group. */
  categories: { slug: string; name: LocalizedText; groupSlug: string }[];
};

async function fetchCategoryGroups(): Promise<CategoryGroup[]> {
  const { data, error } = await supabase
    .from('category_groups')
    .select('slug, name, sort_order, categories(slug, name, sort_order)')
    .order('sort_order');
  if (error) throw error;
  return data.map((group) => ({
    slug: group.slug,
    name: nameOf(group),
    categories: [...group.categories]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((category) => ({
        slug: category.slug,
        name: nameOf(category),
        groupSlug: group.slug,
      })),
  }));
}

/** Vendor types grouped (Venues, Food, Music...), in the database's order. */
export function useCategoryGroups() {
  return useQuery({
    queryKey: [...referenceKeys.all, 'category-groups'],
    queryFn: fetchCategoryGroups,
    ...REFERENCE,
  });
}

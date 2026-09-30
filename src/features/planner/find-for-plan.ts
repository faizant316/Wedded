import { router } from 'expo-router';

import {
  clearSearchFilters,
  setSearchFilters,
  type SearchFilters,
} from '@/features/search/search-filters';

/** The most guests in each band from the Ask form ("100 to 250" is 250). */
const BAND_GUESTS: Record<string, number | null> = {
  under_50: 50,
  '50_100': 100,
  '100_250': 250,
  '250_500': 500,
  '500_plus': 600,
  not_sure: null,
};

/**
 * What an event's guest count means for a search, so setting it in My
 * Wedding changes what Find shows: venues that seat everyone, and for a
 * small event (100 or fewer) the lowest prices first, since a DJ or caterer
 * for 60 people shouldn't cost what one for 600 does.
 */
export function filtersForGuests(
  groupSlug: string,
  guestBand: string | null | undefined,
): Partial<SearchFilters> {
  const guests = guestBand ? (BAND_GUESTS[guestBand] ?? null) : null;
  if (guests === null) return {};
  if (groupSlug === 'venues') return { minGuests: guests };
  return guests <= 100 ? { sort: 'price_low' } : {};
}

/**
 * Find from My Wedding (or Home's Next to book): results for that vendor type
 * and event, with the event's guest count applied as filters. Starts from no
 * filters, so one event's filters never carry over to the next.
 */
export function findForPlan(
  categorySlug: string,
  groupSlug: string,
  eventSlug: string,
  guestBand: string | null | undefined,
) {
  clearSearchFilters();
  setSearchFilters(filtersForGuests(groupSlug, guestBand));
  router.push({ pathname: '/c/[category]', params: { category: categorySlug, event: eventSlug } });
}

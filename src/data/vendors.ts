/**
 * Vendor listing hooks. Only published vendors come back: row level security
 * hides the rest. There's no distance yet (Tab A is adding a cities table and
 * a search_vendors RPC), so founding vendors come first, then A to Z.
 */
import { useQuery } from '@tanstack/react-query';

import type { PriceUnit } from '@/components/vendor-card';
import type { LocalizedText } from '@/i18n/localized';
import { supabase } from '@/lib/supabase';

export const vendorKeys = {
  all: ['vendors'] as const,
  list: (categorySlug: string, eventSlug?: string) =>
    [...vendorKeys.all, 'list', categorySlug, eventSlug ?? null] as const,
  categoryCounts: () => [...vendorKeys.all, 'category-counts'] as const,
};

export type VendorSummary = {
  id: string;
  slug: string;
  /** `pa` is the vendor's Punjabi name (name_pa), when they have one. */
  name: LocalizedText;
  city: string;
  /** "From $X / unit" for starting_at and range prices; null for hidden, contact and packages. */
  startingPrice: { amount: number; unit?: PriceUnit } | null;
  foundingNumber: number | null;
};

const PRICE_UNITS: readonly PriceUnit[] = [
  'event',
  'hour',
  'person',
  'plate',
  'hand',
  'turban',
  'day',
];

type ListingRow = {
  id: string;
  slug: string;
  name: string;
  name_pa: string | null;
  city: string;
  price_display: string;
  price_from: number | null;
  price_unit: string | null;
  founding_number: number | null;
};

export function toVendorSummary(row: ListingRow): VendorSummary {
  const hasFrom = row.price_display === 'starting_at' || row.price_display === 'range';
  return {
    id: row.id,
    slug: row.slug,
    name: row.name_pa ? { en: row.name, pa: row.name_pa } : { en: row.name },
    city: row.city,
    startingPrice:
      hasFrom && row.price_from
        ? { amount: row.price_from, unit: PRICE_UNITS.find((unit) => unit === row.price_unit) }
        : null,
    foundingNumber: row.founding_number,
  };
}

async function fetchVendorsFor(categorySlug: string, eventSlug?: string) {
  // Two literal queries rather than one built up: supabase-js types the rows
  // from the select string, and an inner join on vendor_events must only be
  // there when filtering by event.
  const result = eventSlug
    ? await supabase
        .from('vendors')
        .select(
          'id, slug, name, name_pa, city, price_display, price_from, price_unit, founding_number, vendor_categories!inner(category_slug), vendor_events!inner(event_slug)',
        )
        .eq('vendor_categories.category_slug', categorySlug)
        .eq('vendor_events.event_slug', eventSlug)
        .order('founding_number', { ascending: true, nullsFirst: false })
        .order('name')
    : await supabase
        .from('vendors')
        .select(
          'id, slug, name, name_pa, city, price_display, price_from, price_unit, founding_number, vendor_categories!inner(category_slug)',
        )
        .eq('vendor_categories.category_slug', categorySlug)
        .order('founding_number', { ascending: true, nullsFirst: false })
        .order('name');
  if (result.error) throw result.error;
  const rows: ListingRow[] = result.data;
  return rows.map(toVendorSummary);
}

/** Published vendors in a category, optionally only those who serve an event. */
export function useVendorsFor(categorySlug: string, eventSlug?: string) {
  return useQuery({
    queryKey: vendorKeys.list(categorySlug, eventSlug),
    queryFn: () => fetchVendorsFor(categorySlug, eventSlug),
    enabled: categorySlug.length > 0,
  });
}

async function fetchCategoryVendorCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, vendor_categories(count)');
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.slug, row.vendor_categories[0]?.count ?? 0]));
}

/** How many published vendors each category has, by category slug. */
export function useCategoryVendorCounts() {
  return useQuery({ queryKey: vendorKeys.categoryCounts(), queryFn: fetchCategoryVendorCounts });
}

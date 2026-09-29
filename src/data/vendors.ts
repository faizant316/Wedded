/**
 * Vendor counts for browsing. Only published vendors are counted: row level
 * security hides the rest. Listings themselves come from useVendorSearch() in
 * src/data/search.ts, which sorts by distance.
 */
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export const vendorKeys = {
  all: ['vendors'] as const,
  categoryCounts: () => [...vendorKeys.all, 'category-counts'] as const,
};

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

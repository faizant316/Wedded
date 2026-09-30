/**
 * Vendor numbers (docs/RESEARCH_GROWTH.md #3): anonymous counts of profile
 * views and contact taps, which feed the founders' monthly scorecard for each
 * vendor, and the public lines a vendor page can show: "Saved by N families"
 * and "Replied to N of M families who asked" (each only once 5 or more people
 * are behind it; see the vendor_stats migration).
 */
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type ActivityKind =
  'view' | 'call' | 'text' | 'whatsapp' | 'directions' | 'share' | 'instagram' | 'website';

const viewed = new Set<string>();

/**
 * Count a profile view (once per vendor per app session) or a contact tap.
 * Fire and forget: it never throws and never slows the tap down.
 */
export function trackVendorActivity(vendorId: string, kind: ActivityKind): void {
  if (!vendorId) return;
  if (kind === 'view') {
    if (viewed.has(vendorId)) return;
    viewed.add(vendorId);
  }
  void supabase.rpc('track_vendor_activity', { p_vendor_id: vendorId, p_kind: kind }).then(
    () => undefined,
    () => undefined,
  );
}

export type VendorPublicStats = {
  /** Families who saved them; null below 5. */
  savedBy: number | null;
  /** From the families' follow-up answers; null below 5 answers. */
  replied: { replied: number; answered: number } | null;
};

export async function fetchVendorPublicStats(vendorId: string): Promise<VendorPublicStats> {
  const { data, error } = await supabase.rpc('vendor_public_stats', { p_vendor_id: vendorId });
  if (error) throw error;
  const row = data[0] as
    { saved_by: number | null; replied: number | null; answered: number | null } | undefined;
  return {
    savedBy: row?.saved_by ?? null,
    replied:
      row && row.replied !== null && row.answered !== null
        ? { replied: row.replied, answered: row.answered }
        : null,
  };
}

/** The public stats for a vendor page. Fresh for an hour. */
export function useVendorPublicStats(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-public-stats', vendorId],
    queryFn: () => fetchVendorPublicStats(vendorId),
    enabled: vendorId.length > 0,
    staleTime: 60 * 60 * 1000,
  });
}

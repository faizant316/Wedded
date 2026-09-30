/**
 * Availability (docs/RESEARCH_GROWTH.md #5): whether a vendor is free on a
 * date, from the calendar the founders keep (npm run availability). "unknown"
 * means there's no recent calendar, so the app says nothing rather than
 * promise a date.
 */
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type DateStatus = 'open' | 'booked' | 'held' | 'partly' | 'unknown';

const STATUSES: readonly string[] = ['open', 'booked', 'held', 'partly', 'unknown'];

export function asDateStatus(value: unknown): DateStatus {
  return typeof value === 'string' && STATUSES.includes(value) ? (value as DateStatus) : 'unknown';
}

/** A vendor's status on a yyyy-mm-dd date; off until both are known. */
export function useVendorDateStatus(vendorId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['vendor-date-status', vendorId, date],
    queryFn: async (): Promise<DateStatus> => {
      const { data, error } = await supabase.rpc('vendor_date_status', {
        p_vendor_id: vendorId ?? '',
        p_day: date ?? '',
      });
      if (error) throw error;
      return asDateStatus(data);
    },
    enabled: !!vendorId && !!date,
    staleTime: 5 * 60 * 1000,
  });
}

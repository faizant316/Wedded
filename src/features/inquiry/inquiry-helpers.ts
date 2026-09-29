import { useQuery } from '@tanstack/react-query';

import type { GuestBand } from '@/data/inquiries';
import type { Locale } from '@/i18n';
import { asLocalizedText, localized, type LocalizedText } from '@/i18n/localized';
import { supabase } from '@/lib/supabase';

export const GUEST_BANDS: GuestBand[] = [
  'under_50',
  '50_100',
  '100_250',
  '250_500',
  '500_plus',
  'not_sure',
];

/** A calendar date as YYYY-MM-DD from the phone's own day (never via UTC, so it can't shift). */
export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** YYYY-MM-DD back to a Date at local midnight, for the picker. */
export function fromDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "Sat, Jun 12, 2027". Dates keep Latin digits in both languages (vision §4). */
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(fromDateString(value));
}

type Translate = (key: string, options?: Record<string, string | number>) => string;

/**
 * The suggested message (S11 item 5), in the app's language. It's rewritten as
 * the form changes until they edit it themselves.
 */
export function suggestedMessage(
  t: Translate,
  locale: Locale,
  parts: { events: LocalizedText[]; date: string | null; place: string; guests: GuestBand | null },
): string {
  const joiner = t('inquiry.auto.and');
  const events =
    parts.events.length > 0
      ? parts.events.map((event) => localized(event, locale)).join(` ${joiner} `)
      : t('inquiry.auto.wedding');
  const knownGuests = parts.guests && parts.guests !== 'not_sure' ? parts.guests : null;
  const key = parts.date
    ? knownGuests
      ? 'withDateAndGuests'
      : 'withDate'
    : knownGuests
      ? 'withGuests'
      : 'plain';
  return t(`inquiry.auto.${key}`, {
    events,
    date: parts.date ? formatDate(parts.date) : '',
    place: parts.place.trim() || t('inquiry.auto.ourCity'),
    guests: knownGuests ? t(`inquiry.guestsInMessage.${knownGuests}`) : '',
  });
}

export type InquiryVendor = {
  id: string;
  slug: string;
  name: LocalizedText;
  city: string;
  category: LocalizedText | null;
  callPhone: string | null;
  textPhone: string | null;
  whatsappPhone: string | null;
};

async function fetchInquiryVendor(vendorId: string): Promise<InquiryVendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'id, slug, name, name_pa, city, call_phone, text_phone, whatsapp_phone, vendor_categories(position, category:categories(name))',
    )
    .eq('id', vendorId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const primary = [...data.vendor_categories].sort((a, b) => a.position - b.position)[0];
  return {
    id: data.id,
    slug: data.slug,
    name: data.name_pa ? { en: data.name, pa: data.name_pa } : { en: data.name },
    city: data.city,
    category: primary ? asLocalizedText(primary.category?.name) : null,
    callPhone: data.call_phone,
    textPhone: data.text_phone,
    whatsappPhone: data.whatsapp_phone,
  };
}

/** The vendor being asked, for the form's mini-card and the sent screen. Null if not listed. */
export function useInquiryVendor(vendorId: string) {
  return useQuery({
    queryKey: ['inquiry-vendor', vendorId],
    queryFn: () => fetchInquiryVendor(vendorId),
    enabled: vendorId.length > 0,
  });
}

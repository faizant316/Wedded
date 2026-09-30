import { Platform, Share } from 'react-native';

import { SITE_URL_IS_PLACEHOLDER, siteLink } from '@/constants/links';

type Translate = (key: string, options?: Record<string, string | number>) => string;

/**
 * Opens the phone's share sheet for a vendor, so a family can send them to a
 * cousin on WhatsApp: "Dhol Di Awaaz, Dhol player in Yuba City" plus the page
 * link once the site has a domain. Browsers without a share sheet copy the
 * text instead.
 */
export async function shareVendor(
  vendor: { name: string; category: string | null; city: string; slug: string },
  t: Translate,
): Promise<void> {
  const link = SITE_URL_IS_PLACEHOLDER ? null : siteLink(`/v/${vendor.slug}`);
  const line = vendor.category
    ? t('share.vendor', { name: vendor.name, category: vendor.category, city: vendor.city })
    : t('share.vendorNoCategory', { name: vendor.name, city: vendor.city });
  const message = link ? `${line}\n${link}` : line;

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
    try {
      await navigator.clipboard.writeText(message);
      globalThis.alert(t('share.copied'));
    } catch {
      // Nothing to share with; the page stays as it was.
    }
    return;
  }
  try {
    await Share.share({ message, title: vendor.name });
  } catch {
    // Dismissed or unavailable: nothing to do.
  }
}

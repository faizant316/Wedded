import Head from 'expo-router/head';

import { siteLink } from '@/constants/links';
import { useLocale } from '@/i18n/locale-context';

/**
 * The page's title, description and link-preview tags (Open Graph, Twitter),
 * so a link pasted into WhatsApp or iMessage shows a card instead of a bare
 * URL (docs/RESEARCH_GROWTH.md #7). Web only in effect; phones ignore <Head>.
 *
 * The web build renders each route once, before any data loads, so
 * crawlers (which don't run JavaScript) see the fallback: the app's name and a
 * general description. The real vendor or event details fill in on the page.
 */
export function SocialMeta({
  title,
  description,
  image,
  path,
}: {
  /** Leave out for the app's name alone. */
  title?: string | null;
  description?: string | null;
  /** A full URL to a large photo (about 1080 wide). */
  image?: string | null;
  /** The page's own path, e.g. "/v/royal-orchard", for og:url. */
  path?: string;
}) {
  const { t } = useLocale();
  const site = t('app.name');
  const fullTitle = title ? `${title} · ${site}` : site;
  const text = description || t('meta.description');

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={text} />
      <meta property="og:site_name" content={site} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || site} />
      <meta property="og:description" content={text} />
      {path ? <meta property="og:url" content={siteLink(path)} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title || site} />
      <meta name="twitter:description" content={text} />
      {image ? <meta name="twitter:image" content={image} /> : null}
    </Head>
  );
}

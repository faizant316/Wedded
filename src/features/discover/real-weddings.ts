import type { FeedPost } from '@/data/feed';
import type { VendorPhoto } from '@/data/vendor-media';

export type RealWedding = {
  eventSlug: string;
  /** The photo on the card: the first one tagged with this event. */
  photo: VendorPhoto;
  /** Whose photo that is, so tapping the card opens it in the viewer. */
  vendorSlug: string;
  /** Everyone with photos from this event, in feed order. */
  vendors: Pick<FeedPost, 'vendorId' | 'slug' | 'name'>[];
};

/**
 * Vendors' photos grouped by the event they're tagged with ("Jaago",
 * "Reception"), in the order given (ceremony order), for Discover's "Real
 * weddings" cards. Events without tagged photos are left out.
 */
export function groupRealWeddings(posts: FeedPost[], eventOrder: string[]): RealWedding[] {
  const byEvent = new Map<string, RealWedding>();
  for (const post of posts) {
    for (const photo of post.photos) {
      if (!photo.eventSlug) continue;
      const wedding = byEvent.get(photo.eventSlug);
      const vendor = { vendorId: post.vendorId, slug: post.slug, name: post.name };
      if (!wedding) {
        byEvent.set(photo.eventSlug, {
          eventSlug: photo.eventSlug,
          photo,
          vendorSlug: post.slug,
          vendors: [vendor],
        });
      } else if (!wedding.vendors.some((v) => v.vendorId === post.vendorId)) {
        wedding.vendors.push(vendor);
      }
    }
  }
  const rank = (slug: string) => {
    const i = eventOrder.indexOf(slug);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...byEvent.values()].sort((a, b) => rank(a.eventSlug) - rank(b.eventSlug));
}

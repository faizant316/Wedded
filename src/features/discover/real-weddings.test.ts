import type { FeedPost } from '@/data/feed';
import type { VendorPhoto } from '@/data/vendor-media';

import { groupRealWeddings } from './real-weddings';

const photo = (id: string, eventSlug: string | null): VendorPhoto => ({
  id,
  width: 1,
  height: 1,
  blurhash: null,
  isCover: false,
  eventSlug,
  credit: null,
  url: { small: id, medium: id, large: id },
});

const post = (slug: string, photos: VendorPhoto[]): FeedPost => ({
  vendorId: slug,
  slug,
  name: { en: slug },
  caption: { en: null, pa: null },
  city: 'Yuba City',
  foundingNumber: null,
  category: null,
  price: null,
  photos,
});

describe('groupRealWeddings', () => {
  const posts = [
    post('dhol', [photo('d1', 'jaago'), photo('d2', 'jaago'), photo('d3', null)]),
    post('hall', [photo('h1', 'reception'), photo('h2', 'jaago')]),
  ];

  it('groups by event in the given order, first photo on the card', () => {
    const weddings = groupRealWeddings(posts, ['jaago', 'reception']);
    expect(weddings.map((w) => w.eventSlug)).toEqual(['jaago', 'reception']);
    expect(weddings[0].photo.id).toBe('d1');
    expect(weddings[0].vendorSlug).toBe('dhol');
  });

  it('lists each vendor once per event', () => {
    const [jaago] = groupRealWeddings(posts, ['jaago']);
    expect(jaago.vendors.map((v) => v.slug)).toEqual(['dhol', 'hall']);
  });

  it('puts events missing from the order last and skips untagged photos', () => {
    const weddings = groupRealWeddings(posts, ['reception']);
    expect(weddings.map((w) => w.eventSlug)).toEqual(['reception', 'jaago']);
    expect(groupRealWeddings([post('x', [photo('x1', null)])], [])).toEqual([]);
  });
});

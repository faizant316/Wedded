import { compactCount, toReel } from './reels';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/reels/${path}` } }),
      }),
    },
  },
}));

const row = {
  id: 'r1',
  video_path: 'u1/jaago.mp4',
  thumb_path: 'u1/jaago.jpg',
  duration_s: 5,
  width: 720,
  height: 1280,
  caption: 'Our jaago',
  event_slug: 'jaago',
  created_at: '2026-10-05T10:00:00Z',
  author_id: 'u1',
  author_name: 'Simran K.',
  vendor_id: null,
  vendor_slug: null,
  vendor_name: null,
  tags: [
    { vendor_id: 'v1', slug: 'gabru-dhol', name: 'Gabru Dhol Crew', status: 'approved' },
    { vendor_id: 'v2', slug: 'golden-moments', name: 'Golden Moments', status: 'pending' },
    { vendor_id: 'v3', name: 'No slug' },
    'nonsense',
  ],
  like_count: 12,
  comment_count: 3,
  liked: true,
  following: false,
  is_mine: false,
};

describe('reels', () => {
  it('turns a feed row into a reel with playable links', () => {
    const reel = toReel(row);
    expect(reel.videoUrl).toBe('https://cdn.test/reels/u1/jaago.mp4');
    expect(reel.thumbUrl).toBe('https://cdn.test/reels/u1/jaago.jpg');
    expect(reel.vendor).toBeNull();
    expect(reel.likeCount).toBe(12);
  });

  it('keeps only usable tags, approved or still pending', () => {
    expect(toReel(row).tags).toEqual([
      { vendorId: 'v1', slug: 'gabru-dhol', name: 'Gabru Dhol Crew', approved: true },
      { vendorId: 'v2', slug: 'golden-moments', name: 'Golden Moments', approved: false },
    ]);
  });

  it('shows a vendor post as the business', () => {
    const reel = toReel({
      ...row,
      vendor_id: 'v9',
      vendor_slug: 'rang-mehndi',
      vendor_name: 'Rang Mehndi',
      thumb_path: null,
    });
    expect(reel.vendor).toEqual({ id: 'v9', slug: 'rang-mehndi', name: 'Rang Mehndi' });
    expect(reel.thumbUrl).toBeNull();
  });

  it('writes counts the way people read them under a reel', () => {
    expect(compactCount(0)).toBe('0');
    expect(compactCount(999)).toBe('999');
    expect(compactCount(1000)).toBe('1K');
    expect(compactCount(2450)).toBe('2.5K');
    expect(compactCount(12_400)).toBe('12K');
    expect(compactCount(1_200_000)).toBe('1.2M');
  });
});

import type * as VendorMedia from './vendor-media';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `https://project.supabase.co/storage/v1/object/public/${bucket}/${path}`,
          },
        }),
      }),
    },
  },
}));

/** photoUrl as the app sees it with EXPO_PUBLIC_MEDIA_URL set to `mediaUrl`. */
function photoUrlWith(mediaUrl: string | undefined) {
  const before = process.env.EXPO_PUBLIC_MEDIA_URL;
  if (mediaUrl === undefined) delete process.env.EXPO_PUBLIC_MEDIA_URL;
  else process.env.EXPO_PUBLIC_MEDIA_URL = mediaUrl;
  // A fresh copy of the module, which reads the variable when it loads
  let photoUrl!: typeof VendorMedia.photoUrl;
  jest.isolateModules(() => {
    photoUrl = jest.requireActual<typeof VendorMedia>('./vendor-media').photoUrl;
  });
  if (before === undefined) delete process.env.EXPO_PUBLIC_MEDIA_URL;
  else process.env.EXPO_PUBLIC_MEDIA_URL = before;
  return photoUrl;
}

describe('photoUrl', () => {
  it('uses Supabase Storage by default', () => {
    expect(photoUrlWith(undefined)('v1/p1', 'small')).toBe(
      'https://project.supabase.co/storage/v1/object/public/vendor-media/v1/p1/400.webp',
    );
  });

  it('uses CloudFront when EXPO_PUBLIC_MEDIA_URL is set', () => {
    const photoUrl = photoUrlWith('https://d123.cloudfront.net/');
    expect(photoUrl('v1/p1', 'small')).toBe('https://d123.cloudfront.net/v1/p1/400.webp');
    expect(photoUrl('v1/p1', 'medium')).toBe('https://d123.cloudfront.net/v1/p1/1080.webp');
    expect(photoUrl('v1/p1', 'large')).toBe('https://d123.cloudfront.net/v1/p1/1600.webp');
  });

  it('treats an empty EXPO_PUBLIC_MEDIA_URL as unset', () => {
    expect(photoUrlWith('')('v1/p1', 'large')).toContain('supabase.co');
  });
});

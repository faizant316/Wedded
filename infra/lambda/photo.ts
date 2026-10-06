/**
 * Turns one uploaded photo into the files the app shows: three WebP widths and
 * a meta.json with the size and blurhash. The same sizes and quality as
 * scripts/upload-vendor-photos.ts, so photos look the same wherever they came from.
 */
import { encode } from 'blurhash';
import sharp from 'sharp';

/** The widths `photoUrl(path, size)` asks for (src/data/vendor-media.ts). */
export const WIDTHS = [400, 1080, 1600] as const;

/** Bigger uploads are skipped: no phone photo needs more. */
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const UPLOAD_KEY = new RegExp(`^(${UUID})/(${UUID})\\.(jpe?g|png|webp)$`, 'i');

/** S3 event keys are URL-encoded, with spaces as "+". */
export function uploadKey(eventKey: string): string {
  return decodeURIComponent(eventKey.replace(/\+/g, ' '));
}

/**
 * Where an upload's files go: `<vendor id>/<photo id>.jpg` becomes
 * `<vendor id>/<photo id>/{400,1080,1600}.webp`, the same layout as the
 * vendor-media bucket in Supabase (vendor_media.storage_path). Null for any
 * other key.
 */
export function mediaPrefix(key: string): string | null {
  const match = UPLOAD_KEY.exec(key);
  return match ? `${match[1]}/${match[2]}`.toLowerCase() : null;
}

export function webpQuality(width: number): number {
  return width === 400 ? 70 : 80;
}

export class NotAnImageError extends Error {}

export type PhotoMeta = {
  /** Of the largest file (1600 wide, or the original when it's smaller). */
  width: number;
  height: number;
  blurhash: string;
};

export type RenderedPhoto = {
  files: { name: string; data: Buffer; contentType: string }[];
  meta: PhotoMeta;
};

async function blurhashOf(image: Buffer): Promise<string> {
  const { data, info } = await sharp(image)
    .rotate()
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

/**
 * Resizes a photo. `rotate()` turns it upright from its EXIF orientation, and
 * WebP output drops the EXIF, so a phone photo's GPS position never reaches
 * the public files.
 */
export async function renderPhoto(original: Buffer): Promise<RenderedPhoto> {
  try {
    const { width, height } = await sharp(original).metadata();
    if (!width || !height) throw new Error('no size');
  } catch {
    throw new NotAnImageError('Not a readable image');
  }

  const files: RenderedPhoto['files'] = [];
  let largest = { width: 0, height: 0 };
  for (const width of WIDTHS) {
    const { data, info } = await sharp(original)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: webpQuality(width) })
      .toBuffer({ resolveWithObject: true });
    files.push({ name: `${width}.webp`, data, contentType: 'image/webp' });
    largest = { width: info.width, height: info.height };
  }

  const meta: PhotoMeta = { ...largest, blurhash: await blurhashOf(original) };
  files.push({
    name: 'meta.json',
    data: Buffer.from(JSON.stringify(meta)),
    contentType: 'application/json',
  });
  return { files, meta };
}

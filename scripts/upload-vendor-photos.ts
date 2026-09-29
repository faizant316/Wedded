/**
 * Upload vendor photos (vision §7: the seed script that "resizes photos into
 * three WebP variants with a blurhash, uploads them and upserts by slug"; the
 * same tool later ingests real founding vendors).
 *
 *   npm run photos:upload -- <folder> [--local]
 *   npm run photos:samples                       (local; npm run photos:upload -- --samples for hosted)
 *
 * <folder> has one subfolder per vendor slug with .jpg, .jpeg, .png or .webp
 * files. Files are sorted by name; a file named cover.* (or the first file,
 * when the vendor has no cover yet) becomes the cover. An optional
 * photos.json in the vendor's folder tags files:
 *   { "cover.jpg": { "event": "reception", "venue": "royal-orchard-banquet-hall", "credit": "frames-by-jas" } }
 * credit is a vendor slug, or free text for someone not listed.
 *
 * Each photo becomes vendor-media/<vendor id>/<photo id>/{400,1080,1600}.webp
 * plus a vendor_media row. Photo ids come from the vendor and file name, so
 * running it again updates photos instead of duplicating them.
 *
 * --local uses the local Supabase (`supabase status`). Otherwise set
 * SUPABASE_URL and SUPABASE_SECRET_KEY (the service role key; never commit it).
 * --samples makes labelled placeholder photos for the sample vendors, with
 * some tagged at a venue for its "Real weddings here": Royal Orchard, or
 * --venue=<slug> (e.g. the real hall for the demo).
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { SupabaseClient } from '@supabase/supabase-js';
import { encode } from 'blurhash';
import sharp from 'sharp';

import { connect, fail } from './connect';

const WIDTHS = [400, 1080, 1600] as const;
const BUCKET = 'vendor-media';
const IMAGE = /\.(jpe?g|png|webp)$/i;

type Tags = { event?: string; venue?: string; credit?: string };
type Photo = { fileName: string; data: Buffer; tags: Tags; isCover?: boolean };

/** A stable UUID from text, so the same vendor and file always get the same photo id. */
function stableId(text: string): string {
  const hex = createHash('sha256').update(text).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function blurhashOf(image: Buffer): Promise<string> {
  const { data, info } = await sharp(image)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

async function vendorIdsBySlug(
  supabase: SupabaseClient,
  slugs: string[],
): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('vendors').select('id, slug').in('slug', slugs);
  if (error) fail(`Could not read vendors: ${error.message}`);
  return new Map(data.map((row) => [row.slug as string, row.id as string]));
}

async function uploadVendorPhotos(supabase: SupabaseClient, vendorSlug: string, photos: Photo[]) {
  const tagSlugs = photos
    .flatMap((photo) => [photo.tags.venue, photo.tags.credit])
    .filter(Boolean) as string[];
  const ids = await vendorIdsBySlug(supabase, [vendorSlug, ...tagSlugs]);
  const vendorId = ids.get(vendorSlug);
  if (!vendorId) fail(`No vendor with the slug "${vendorSlug}".`);

  const { data: existing } = await supabase
    .from('vendor_media')
    .select('id, is_cover, sort_order')
    .eq('vendor_id', vendorId);
  const hasCover = (existing ?? []).some((row) => row.is_cover);
  let nextOrder = Math.max(0, ...(existing ?? []).map((row) => row.sort_order as number)) + 1;
  const explicitCover = photos.some((photo) => photo.isCover || /^cover\./i.test(photo.fileName));

  for (const [index, photo] of photos.entries()) {
    const photoId = stableId(`${vendorId}/${photo.fileName}`);
    const storagePath = `${vendorId}/${photoId}`;
    const source = sharp(photo.data).rotate();
    const meta = await source.metadata();
    if (!meta.width || !meta.height)
      fail(`${vendorSlug}/${photo.fileName} is not a readable image.`);

    let largest = { width: meta.width, height: meta.height };
    for (const width of WIDTHS) {
      const { data, info } = await sharp(photo.data)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width === 400 ? 70 : 80 })
        .toBuffer({ resolveWithObject: true });
      largest = { width: info.width, height: info.height };
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${storagePath}/${width}.webp`, data, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });
      if (error) fail(`Upload failed for ${vendorSlug}/${photo.fileName}: ${error.message}`);
    }

    const isCover = explicitCover
      ? Boolean(photo.isCover || /^cover\./i.test(photo.fileName))
      : !hasCover && index === 0;
    const already = (existing ?? []).find((row) => row.id === photoId);
    const creditId = photo.tags.credit ? ids.get(photo.tags.credit) : undefined;
    if (isCover) {
      // Only one cover per vendor
      await supabase
        .from('vendor_media')
        .update({ is_cover: false })
        .eq('vendor_id', vendorId)
        .neq('id', photoId);
    }
    const { error } = await supabase.from('vendor_media').upsert({
      id: photoId,
      vendor_id: vendorId,
      storage_path: storagePath,
      width: largest.width,
      height: largest.height,
      blurhash: await blurhashOf(photo.data),
      is_cover: isCover,
      sort_order: already ? (already.sort_order as number) : nextOrder++,
      event_slug: photo.tags.event ?? null,
      venue_vendor_id: photo.tags.venue ? (ids.get(photo.tags.venue) ?? null) : null,
      credit_vendor_id: creditId ?? null,
      credit_text: photo.tags.credit && !creditId ? photo.tags.credit : null,
    });
    if (error) fail(`Could not save ${vendorSlug}/${photo.fileName}: ${error.message}`);
    console.log(`  ${vendorSlug}/${photo.fileName}${isCover ? ' (cover)' : ''}`);
  }
}

function readFolder(folder: string): [string, Photo[]][] {
  if (!existsSync(folder) || !statSync(folder).isDirectory()) fail(`${folder} is not a folder.`);
  return readdirSync(folder)
    .filter((name) => statSync(join(folder, name)).isDirectory())
    .map((slug) => {
      const dir = join(folder, slug);
      const tagsFile = join(dir, 'photos.json');
      const tags: Record<string, Tags> = existsSync(tagsFile)
        ? JSON.parse(readFileSync(tagsFile, 'utf8'))
        : {};
      const photos = readdirSync(dir)
        .filter((name) => IMAGE.test(name))
        .sort()
        .map((fileName) => ({
          fileName,
          data: readFileSync(join(dir, fileName)),
          tags: tags[fileName] ?? {},
        }));
      return [slug, photos] as [string, Photo[]];
    })
    .filter(([, photos]) => photos.length > 0);
}

// Placeholder photos for the sample vendors (local only) ----------------------

const PALETTE = [
  ['#8A1C30', '#F0A030'],
  ['#A8500A', '#FFF9F0'],
  ['#3D6B33', '#F0A030'],
  ['#B4335C', '#FFF9F0'],
];

function escapeXml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function placeholder(name: string, caption: string, variant: number): Promise<Buffer> {
  const [from, to] = PALETTE[variant % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="1600" height="1067" fill="url(#g)"/>
    <text x="800" y="480" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700"
      fill="#FFFFFF" text-anchor="middle">${escapeXml(name)}</text>
    <text x="800" y="600" font-family="Arial, Helvetica, sans-serif" font-size="56"
      fill="#FFFFFF" text-anchor="middle">${escapeXml(caption)}</text>
    <text x="800" y="980" font-family="Arial, Helvetica, sans-serif" font-size="40"
      fill="#FFFFFF" fill-opacity="0.8" text-anchor="middle">Sample photo</text>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
}

async function uploadSamples(supabase: SupabaseClient, venueSlug: string) {
  const { data: venue } = await supabase
    .from('vendors')
    .select('name')
    .eq('slug', venueSlug)
    .maybeSingle();
  if (!venue) fail(`No vendor with the slug "${venueSlug}" for --venue.`);

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('slug, name')
    .eq('is_sample', true)
    .order('slug');
  if (error) fail(`Could not read sample vendors: ${error.message}`);

  // Photos other vendors took at the venue, for its "Real weddings here"
  const atVenue: Record<string, Tags> = {
    'frames-by-jas': { event: 'reception', venue: venueSlug, credit: 'frames-by-jas' },
    'marigold-stage-decor': { event: 'reception', venue: venueSlug, credit: 'frames-by-jas' },
    'valley-beats-dj': { event: 'jaago', venue: venueSlug },
  };

  for (const [index, vendor] of vendors.entries()) {
    const photos: Photo[] = [];
    for (let n = 1; n <= 3; n += 1) {
      const venueTags = n === 2 ? atVenue[vendor.slug as string] : undefined;
      photos.push({
        fileName: `sample-${n}.jpg`,
        data: await placeholder(
          vendor.name as string,
          venueTags ? `At ${venue.name as string}` : `Photo ${n}`,
          index + n,
        ),
        tags: venueTags ?? {},
        isCover: n === 1,
      });
    }
    await uploadVendorPhotos(supabase, vendor.slug as string, photos);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const samples = args.includes('--samples');
  const local = args.includes('--local');
  const venueSlug =
    args.find((arg) => arg.startsWith('--venue='))?.slice('--venue='.length) ??
    'royal-orchard-banquet-hall';
  const folder = args.find((arg) => !arg.startsWith('--'));
  const supabase = connect(local);

  if (samples) {
    console.log('Uploading placeholder photos for the sample vendors…');
    await uploadSamples(supabase, venueSlug);
  } else {
    if (!folder) fail('Usage: npm run photos:upload -- <folder> [--local]');
    for (const [slug, photos] of readFolder(folder)) {
      console.log(`${slug}: ${photos.length} photo(s)`);
      await uploadVendorPhotos(supabase, slug, photos);
    }
  }
  console.log('Done.');
}

void main();

/**
 * Copy vendor photos that are only in Supabase Storage to the AWS media bucket
 * (infra/), so the app can load every photo from CloudFront
 * (EXPO_PUBLIC_MEDIA_URL). The files are already sized, so they go straight to
 * the media bucket instead of through the Lambda. Photos already on AWS are
 * skipped, so it's safe to run again.
 *
 *   npm run photos:to-aws -- [--local]
 *
 * --local uses the local Supabase; otherwise set SUPABASE_URL and
 * SUPABASE_SECRET_KEY. AWS sign-in as in scripts/aws-media.ts.
 */
import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

import { connectAws, type AwsMedia } from './aws-media';
import { connect, fail } from './connect';

const WIDTHS = [400, 1080, 1600];
const PAGE = 1000;

async function keysOnAws(aws: AwsMedia): Promise<Set<string>> {
  const keys = new Set<string>();
  let token: string | undefined;
  do {
    const page = await aws.s3.send(
      new ListObjectsV2Command({ Bucket: aws.mediaBucket, ContinuationToken: token }),
    );
    for (const object of page.Contents ?? []) if (object.Key) keys.add(object.Key);
    token = page.NextContinuationToken;
  } while (token);
  return keys;
}

async function main() {
  const supabase = connect(process.argv.includes('--local'));
  const aws = await connectAws();

  const paths: string[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('vendor_media')
      .select('storage_path')
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) fail(`Could not read vendor_media: ${error.message}`);
    paths.push(...data.map((row) => row.storage_path as string));
    if (data.length < PAGE) break;
  }

  const onAws = await keysOnAws(aws);
  let copied = 0;
  let failed = 0;
  for (const storagePath of paths) {
    const files = WIDTHS.map((width) => `${storagePath}/${width}.webp`).filter(
      (file) => !onAws.has(file),
    );
    if (files.length === 0) continue;
    const results = await Promise.all(
      files.map(async (file) => {
        const { data, error } = await supabase.storage.from('vendor-media').download(file);
        if (error || !data) {
          console.warn(`  Not in Supabase Storage either: ${file}`);
          return false;
        }
        await aws.s3.send(
          new PutObjectCommand({
            Bucket: aws.mediaBucket,
            Key: file,
            Body: Buffer.from(await data.arrayBuffer()),
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );
        return true;
      }),
    );
    if (results.every(Boolean)) copied += 1;
    else failed += 1;
  }

  console.log(
    `${paths.length} photos: copied ${copied}, ${paths.length - copied - failed} were already on AWS` +
      (failed ? `, ${failed} incomplete (see above)` : '') +
      '.',
  );
  if (failed) process.exit(1);
}

void main();

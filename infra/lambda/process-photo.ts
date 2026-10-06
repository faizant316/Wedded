/**
 * Runs when a photo lands in the uploads bucket: reads it, resizes it
 * (photo.ts) and writes the results to the media bucket, which CloudFront
 * serves. The original stays private and expires after a week.
 */
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { S3Event } from 'aws-lambda';

import { MAX_UPLOAD_BYTES, NotAnImageError, mediaPrefix, renderPhoto, uploadKey } from './photo';

const s3 = new S3Client({});
const MEDIA_BUCKET = process.env.MEDIA_BUCKET;

// Each photo gets a new id, so a file at a path never changes
const IMMUTABLE = 'public, max-age=31536000, immutable';

export async function handler(event: S3Event): Promise<void> {
  if (!MEDIA_BUCKET) throw new Error('MEDIA_BUCKET is not set');

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = uploadKey(record.s3.object.key);
    const prefix = mediaPrefix(key);

    // Skipped uploads return normally: retrying them would fail the same way
    if (!prefix) {
      console.warn(`Skipped ${key}: expected <vendor id>/<photo id>.jpg, .png or .webp`);
      continue;
    }
    if (record.s3.object.size > MAX_UPLOAD_BYTES) {
      console.warn(`Skipped ${key}: ${record.s3.object.size} bytes is over the limit`);
      continue;
    }

    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!object.Body) throw new Error(`${key} has no body`);
    const original = Buffer.from(await object.Body.transformToByteArray());

    let rendered;
    try {
      rendered = await renderPhoto(original);
    } catch (error) {
      if (error instanceof NotAnImageError) {
        console.warn(`Skipped ${key}: not a readable image`);
        continue;
      }
      throw error;
    }

    // Any other failure throws, and Lambda tries the upload again (twice)
    await Promise.all(
      rendered.files.map((file) =>
        s3.send(
          new PutObjectCommand({
            Bucket: MEDIA_BUCKET,
            Key: `${prefix}/${file.name}`,
            Body: file.data,
            ContentType: file.contentType,
            CacheControl: IMMUTABLE,
          }),
        ),
      ),
    );
    console.log(
      JSON.stringify({ photo: prefix, ...rendered.meta, bytesIn: record.s3.object.size }),
    );
  }
}

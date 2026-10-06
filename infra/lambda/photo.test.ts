import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import sharp from 'sharp';

import { NotAnImageError, mediaPrefix, renderPhoto, uploadKey, webpQuality } from './photo';

const VENDOR = '0b7f4a52-3c1e-4d8a-9f6b-2e5c8a1d7b40';
const PHOTO = '5d2e9c14-7a3b-4f60-8e1d-9c4b2a7f6e13';

function jpeg(width: number, height: number) {
  return sharp({ create: { width, height, channels: 3, background: '#8A1C30' } })
    .jpeg()
    .toBuffer();
}

describe('uploadKey', () => {
  it('decodes S3 event keys', () => {
    assert.equal(uploadKey('a+b%2Fc.jpg'), 'a b/c.jpg');
  });
});

describe('mediaPrefix', () => {
  it('maps <vendor id>/<photo id>.<ext> to the media folder, in lowercase', () => {
    assert.equal(mediaPrefix(`${VENDOR}/${PHOTO}.jpg`), `${VENDOR}/${PHOTO}`);
    assert.equal(mediaPrefix(`${VENDOR}/${PHOTO.toUpperCase()}.JPEG`), `${VENDOR}/${PHOTO}`);
    assert.equal(mediaPrefix(`${VENDOR}/${PHOTO}.png`), `${VENDOR}/${PHOTO}`);
    assert.equal(mediaPrefix(`${VENDOR}/${PHOTO}.webp`), `${VENDOR}/${PHOTO}`);
  });

  it('refuses anything else', () => {
    for (const key of [
      `${PHOTO}.jpg`,
      `${VENDOR}/${PHOTO}.heic`,
      `${VENDOR}/${PHOTO}.jpg.exe`,
      `${VENDOR}/../${PHOTO}.jpg`,
      `x/${VENDOR}/${PHOTO}.jpg`,
      `${VENDOR}/not-a-uuid.jpg`,
    ]) {
      assert.equal(mediaPrefix(key), null, key);
    }
  });
});

describe('renderPhoto', () => {
  it('makes three WebP widths and meta.json', async () => {
    const { files, meta } = await renderPhoto(await jpeg(2400, 1600));
    assert.deepEqual(
      files.map((file) => file.name),
      ['400.webp', '1080.webp', '1600.webp', 'meta.json'],
    );
    for (const [index, width] of [400, 1080, 1600].entries()) {
      const info = await sharp(files[index].data).metadata();
      assert.equal(info.format, 'webp');
      assert.equal(info.width, width);
    }
    assert.equal(meta.width, 1600);
    assert.equal(meta.height, 1067);
    assert.ok(meta.blurhash.length >= 6);
    assert.deepEqual(JSON.parse(files[3].data.toString()), meta);
  });

  it('never enlarges a small photo', async () => {
    const { files, meta } = await renderPhoto(await jpeg(300, 200));
    for (const file of files.slice(0, 3)) {
      assert.equal((await sharp(file.data).metadata()).width, 300);
    }
    assert.deepEqual([meta.width, meta.height], [300, 200]);
  });

  it('refuses files that are not images', async () => {
    await assert.rejects(renderPhoto(Buffer.from('not a photo')), NotAnImageError);
  });

  it('uses a lower quality for the small size', () => {
    assert.equal(webpQuality(400), 70);
    assert.equal(webpQuality(1600), 80);
  });
});

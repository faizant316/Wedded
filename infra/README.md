# Wedded on AWS

Infrastructure as code with the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) (TypeScript). One stack so far, `WeddedMedia`: vendor photos.

```
app ──PUT──▶ S3 uploads ──event──▶ Lambda (sharp) ──▶ S3 media ◀── CloudFront ◀── app
```

- **Uploads bucket** (private): photos as uploaded, at `<vendor id>/<photo id>.jpg` (or `.png`, `.webp`). They expire after 7 days. They're never served, because phone photos carry GPS in their EXIF.
- **ProcessPhoto Lambda** (`lambda/process-photo.ts`, Node 24 on ARM): runs for each upload and writes `<vendor id>/<photo id>/{400,1080,1600}.webp` and `meta.json` (`{ width, height, blurhash }`) to the media bucket. The sizes and quality match `scripts/upload-vendor-photos.ts`, and the layout matches `vendor_media.storage_path` in Supabase, so `photoUrl()` could point here by changing its base URL.
- **Media bucket** (private) behind **CloudFront** with Origin Access Control: only the distribution can read it, and files are cached for a year (each photo id is new, so a file never changes).

**The app** loads photos from here when `EXPO_PUBLIC_MEDIA_URL` is set to `MediaUrl`, through `photoUrl()` in `src/data/vendor-media.ts`; otherwise it uses Supabase Storage. Photos get here with `npm run photos:upload -- <folder> --aws` or `npm run photos:samples -- --aws` (`scripts/aws-media.ts`). That script uploads each original, waits for the Lambda's `meta.json`, and saves the `vendor_media` row with its size and blurhash. Photos already in Supabase Storage are copied over with `npm run photos:to-aws` (`scripts/copy-photos-to-aws.ts`). They're already sized, so they go straight to the media bucket.

Vendors can't upload from the app yet. That needs a hosted Supabase project, because a Lambda can't reach a database on a laptop, and the "My business" screens.

## First time

1. Install the AWS CLI, then sign in through the browser. It lasts 12 hours and renews itself for 90 days:
   ```
   aws login --region us-east-2 --profile wedded
   ```
2. `cd infra && npm install`
3. Once per AWS account: `npx cdk bootstrap --profile wedded`. It creates the bucket and roles CDK deploys with.

The Region is fixed to `us-east-2` in `bin/infra.ts`, because projects in AWS's new experience can only use the Region they were created in.

## Change and deploy

```
npm run typecheck && npm test        # what CI runs, plus `npx cdk synth`
npx cdk diff --profile wedded        # what would change in AWS
npx cdk deploy --profile wedded      # asks before creating or widening IAM permissions
```

The outputs are `UploadsBucket` and `MediaUrl`.

## Try it

```
aws s3 cp photo.jpg s3://<UploadsBucket>/<vendor uuid>/<photo uuid>.jpg --profile wedded
```

A few seconds later, `<MediaUrl>/<vendor uuid>/<photo uuid>/1080.webp` and `meta.json` load in a browser. The Lambda's logs are in CloudWatch under `WeddedMedia-ProcessPhotoLogs…`, one JSON line per photo.

## Cost

On the Free plan nothing can be charged. Each photo costs a few hundred milliseconds of Lambda time, and a profile view is about 500 KB from CloudFront.

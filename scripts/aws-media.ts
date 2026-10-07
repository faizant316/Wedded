/**
 * Vendor photos through AWS (infra/, the WeddedMedia stack): upload the
 * original to the uploads bucket, then wait for the ProcessPhoto Lambda to
 * write the sizes and meta.json to the media bucket, which CloudFront serves.
 *
 * Signs in with the AWS CLI profile in AWS_PROFILE, or "wedded":
 *   aws login --region us-east-2 --profile wedded
 */
import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
} from '@aws-sdk/client-cloudformation';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { fail } from './connect';

const STACK = 'WeddedMedia';
const REGION = 'us-east-2';

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export type AwsMedia = { s3: S3Client; uploadsBucket: string; mediaBucket: string };

/** What the Lambda writes to meta.json. */
export type PhotoMeta = { width: number; height: number; blurhash: string };

/** Finds the stack's two buckets. */
export async function connectAws(): Promise<AwsMedia> {
  const profile = process.env.AWS_PROFILE ?? 'wedded';
  const cloudformation = new CloudFormationClient({ region: REGION, profile });
  let resources;
  try {
    ({ StackResources: resources } = await cloudformation.send(
      new DescribeStackResourcesCommand({ StackName: STACK }),
    ));
  } catch (error) {
    fail(
      `Could not read the ${STACK} stack with the AWS profile "${profile}": ${(error as Error).message}\n` +
        `Sign in with: aws login --region ${REGION} --profile ${profile}`,
    );
  }
  const bucket = (prefix: string) =>
    resources?.find(
      (resource) =>
        resource.ResourceType === 'AWS::S3::Bucket' &&
        resource.LogicalResourceId?.startsWith(prefix),
    )?.PhysicalResourceId;
  const uploadsBucket = bucket('Uploads');
  const mediaBucket = bucket('Media');
  if (!uploadsBucket || !mediaBucket) {
    fail(
      `The ${STACK} stack has no uploads or media bucket. Deploy it: cd infra && npx cdk deploy`,
    );
  }
  return { s3: new S3Client({ region: REGION, profile }), uploadsBucket, mediaBucket };
}

/**
 * Uploads a photo to `<storagePath>.<ext>` and returns its size and blurhash
 * once the Lambda has written `<storagePath>/{400,1080,1600}.webp`.
 */
export async function processOnAws(
  aws: AwsMedia,
  storagePath: string,
  fileName: string,
  data: Buffer,
): Promise<PhotoMeta> {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  const key = `${storagePath}.${extension}`;
  await aws.s3.send(
    new PutObjectCommand({
      Bucket: aws.uploadsBucket,
      Key: key,
      Body: data,
      ContentType: CONTENT_TYPES[extension],
    }),
  );
  // By S3's clock, so a meta.json left from an earlier upload of the same
  // photo doesn't count
  const { LastModified: uploadedAt } = await aws.s3.send(
    new HeadObjectCommand({ Bucket: aws.uploadsBucket, Key: key }),
  );

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const meta = await aws.s3.send(
        new GetObjectCommand({ Bucket: aws.mediaBucket, Key: `${storagePath}/meta.json` }),
      );
      if (!uploadedAt || !meta.LastModified || meta.LastModified >= uploadedAt) {
        return JSON.parse((await meta.Body?.transformToString()) ?? '') as PhotoMeta;
      }
    } catch (error) {
      if ((error as { name?: string }).name !== 'NoSuchKey') throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  fail(`AWS didn't finish ${key} within a minute. Check the ProcessPhoto logs in CloudWatch.`);
}

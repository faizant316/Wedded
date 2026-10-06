import * as path from 'node:path';

import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import type { Construct } from 'constructs';

/**
 * Vendor photos on AWS: a photo uploaded to the private uploads bucket is
 * resized by a Lambda into the media bucket, and CloudFront serves the media
 * bucket to the app.
 *
 *   app ──PUT──▶ S3 uploads ──event──▶ Lambda (sharp) ──▶ S3 media ◀── CloudFront ◀── app
 */
export class MediaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Originals as uploaded. Never served: phone photos carry GPS in their EXIF
    const uploads = new s3.Bucket(this, 'Uploads', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [
        { expiration: Duration.days(7), abortIncompleteMultipartUploadAfter: Duration.days(1) },
      ],
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // The resized files. Private too: only CloudFront can read them
    const media = new s3.Bucket(this, 'Media', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const processPhoto = new NodejsFunction(this, 'ProcessPhoto', {
      description: 'Resizes an uploaded vendor photo into WebP sizes and a blurhash',
      entry: path.join(__dirname, '../lambda/process-photo.ts'),
      runtime: lambda.Runtime.NODEJS_24_X,
      // Graviton: about 20% cheaper than x86 for the same work
      architecture: lambda.Architecture.ARM_64,
      // Lambda gives CPU in proportion to memory, and sharp is CPU-bound
      memorySize: 1536,
      timeout: Duration.seconds(60),
      environment: { MEDIA_BUCKET: media.bucketName },
      logGroup: new logs.LogGroup(this, 'ProcessPhotoLogs', {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      projectRoot: path.join(__dirname, '..'),
      depsLockFilePath: path.join(__dirname, '../package-lock.json'),
      bundling: {
        tsconfig: path.join(__dirname, '../tsconfig.json'),
        // sharp has native code, so it's installed for Lambda's Linux on ARM
        // instead of bundled from this computer's copy
        nodeModules: ['sharp'],
        environment: { npm_config_os: 'linux', npm_config_cpu: 'arm64', npm_config_libc: 'glibc' },
      },
    });
    uploads.grantRead(processPhoto);
    media.grantPut(processPhoto);
    uploads.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processPhoto),
    );

    const cdn = new cloudfront.Distribution(this, 'MediaCdn', {
      comment: 'Wedded vendor photos',
      defaultBehavior: {
        // Origin Access Control: CloudFront signs its requests, and the bucket
        // policy lets only this distribution read
        origin: origins.S3BucketOrigin.withOriginAccessControl(media),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      // North America and Europe edges only: the families are in California
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    new CfnOutput(this, 'UploadsBucket', { value: uploads.bucketName });
    new CfnOutput(this, 'MediaUrl', { value: `https://${cdn.distributionDomainName}` });
  }
}

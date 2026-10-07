import { App, Tags } from 'aws-cdk-lib';

import { MediaStack } from '../lib/media-stack';

const app = new App();

new MediaStack(app, 'WeddedMedia', {
  // The account comes from the AWS CLI profile you deploy with. The Region is
  // fixed: AWS projects in the new AWS experience can only use the one Region
  // they were created in.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-2' },
  description: 'Wedded vendor photos: S3 uploads, a resizing Lambda and a CloudFront CDN',
});

Tags.of(app).add('project', 'wedded');

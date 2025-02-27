#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkCrudStack } from '../lib/aws-cdk-crud-stack';
import { CodePipelineStack } from '../lib/aws-cdk-crud-pipeline';

const app = new cdk.App();
// new AwsCdkCrudStack(app, 'AwsCdkCrudStack', {
//   stackName: 'AwsCdkCrudStack',
//   description: 'AWS CDK CRUD Stack',
//   env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//   tags: {
//     'user': 'nijil',
//   },
// });

new CodePipelineStack(app, 'AwsCdkCrudPipelineStack', {
  stackName: 'AwsCdkCrudPipelineStack',
  description: 'AWS CDK CRUD Pipeline Stack',
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  tags: {
    'user': 'nijil',
  },
});

app.synth();
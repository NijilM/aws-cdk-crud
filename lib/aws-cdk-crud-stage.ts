import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AwsCdkCrudStack } from './aws-cdk-crud-stack';

export class AwsCdkCrudStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AwsCdkCrudStack(this, 'AwsCdkCrudStack', {
      stackName: 'AwsCdkCrudStack',
      description: 'AWS CDK CRUD Stack',
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
      tags: {
        'user': 'nijil',
      },
    });
  }
}
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AwsCdkCrudStack } from './aws-cdk-crud-stack';

export class AwsCdkCrudStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AwsCdkCrudStack(this, 'AwsCdkCrudStack');
  }
}
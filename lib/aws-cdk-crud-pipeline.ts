import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { AwsCdkCrudStage } from './aws-cdk-crud-stage';

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('user', 'nijil');

    // Pipeline
    const pipeline = new CodePipeline(this, 'CrudOperationsPipeline', {
      pipelineName: 'CrudOperationsPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('NijilM/aws-cdk-crud', 'main', {
          authentication: cdk.SecretValue.secretsManager('github-token'),
        }),
        commands: [
          'npm install',
          'npm ci',
          'npm run build',
          'npx cdk synth "*"'
        ],
        primaryOutputDirectory: 'cdk.out',
      }),
      publishAssetsInParallel: true
    });

    // Deploy to Dev stage
    const devStage = pipeline.addStage(new AwsCdkCrudStage(this, 'Dev', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }));



    //Deploy to Prod stage
    const prodStage = pipeline.addStage(new AwsCdkCrudStage(this, 'Prod', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }));

    prodStage.addPre(new ManualApprovalStep('ApproveDeploymentToProd'));




  }
}
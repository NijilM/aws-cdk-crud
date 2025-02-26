import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { CodePipelineSource, ShellStep, CodePipeline } from 'aws-cdk-lib/pipelines';
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
        commands: ['export CDK_DISABLE_VERSION_CHECK=true','npm ci', 'npm run build', 'npx cdk synth'],
        primaryOutputDirectory: 'cdk.out',
      }),
    });


    // Deploy to Dev stage
    const devStage = new AwsCdkCrudStage(this, 'Dev', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
      });

      pipeline.addStage(devStage, {
        pre: [new ShellStep('DeployToDev', {
          commands: ['export CDK_DISABLE_VERSION_CHECK=true',
            'npx cdk deploy AwsCdkCrudStack --require-approval never'],
        })],
      });
      
    
  }
}
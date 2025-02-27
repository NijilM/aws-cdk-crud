import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkCrudStack extends cdk.Stack {
  constructor(scope: Construct, id: string,environment:string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('user', 'nijil');
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCdkCrudQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });


    // Define the DynamoDB table
    const studentTable = new dynamodb.Table(this, 'StudentsTable'+environment, {
      partitionKey: { name: 'studentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'subjectName', type: dynamodb.AttributeType.STRING },
      tableName: 'Students'+environment,
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Define the IAM role for the Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaRole'+environment, {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('dynamodb.amazonaws.com')
      ),
    });

    // Attach the necessary policies to the role
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['dynamodb:PutItem'],
      resources: [studentTable.tableArn],
    }));


    // Define the Lambda function
    const insertStudentMarksLambda = new lambda.Function(this, 'InsertStudentMarksFunction'+id, {
      functionName: 'InsertStudentMarksFunction'+environment,
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insert-student-marks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      environment: {
        TABLE_NAME: studentTable.tableName,
      },
      role: lambdaRole,
    });

        // Create the API Gateway
        const api = new apigateway.RestApi(this, 'StudentMarkApi'+environment, {
          restApiName: 'Student Mark Service'+environment,
          description: 'This service serves student mark operations.',
        });
    
        // Integrate the Lambda function with the API Gateway
        const putIntegration = new apigateway.LambdaIntegration(insertStudentMarksLambda);
    
        // Create a resource and method for the PUT request
        const studentResource = api.root.addResource('insertStudentMarks');
        studentResource.addMethod('PUT', putIntegration); // PUT /student

  }
}

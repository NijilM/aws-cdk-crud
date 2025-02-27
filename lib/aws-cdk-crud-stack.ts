import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkCrudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, environment: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('user', 'nijil');
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCdkCrudQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });


    // Define the DynamoDB table
    const studentTable = new dynamodb.Table(this, 'StudentsTable' + environment, {
      partitionKey: { name: 'studentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'subjectName', type: dynamodb.AttributeType.STRING },
      tableName: 'Students' + environment,
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Define the IAM role for the Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaRole' + environment, {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('dynamodb.amazonaws.com')
      ),
    });

    // Attach the necessary policies to the role
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:DeleteItem'],
      resources: [studentTable.tableArn],
    }));


    //Lambda function to insert student marks
    const insertStudentMarksLambda = new lambda.Function(this, 'InsertStudentMarksFunction' + id, {
      functionName: 'InsertStudentMarksFunction' + environment,
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
    const studentApi = new apigateway.RestApi(this, 'StudentMarkApi' + environment, {
      restApiName: 'Student Mark Service' + environment,
      description: 'This service serves student mark operations.',
    });

    // Output the API Gateway endpoint
    new cdk.CfnOutput(this, 'Student ApiGateway Endpoint', {
      value: studentApi.url,
      description: 'The endpoint URL for the Student API Gateway',
    });

    // Integrate the Create Lambda function with the API Gateway
    const postIntegration = new apigateway.LambdaIntegration(insertStudentMarksLambda);

    // Create a resource and method for the POST request
    const studentResource = studentApi.root.addResource('insertStudentMarks');
    studentResource.addMethod('POST', postIntegration);

    //Lambda function to get mark of student based on Student Id and Subject
    const getStudentMarksLambda = new lambda.Function(this, 'GetStudentMarksFunction' + environment, {
      functionName: 'GetStudentMarksFunction' + environment,
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-student-marks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      environment: {
        TABLE_NAME: studentTable.tableName,
      },
      role: lambdaRole,
    });

    // Integrate the Get Lambda function with the API Gateway
    const getIntegration = new apigateway.LambdaIntegration(getStudentMarksLambda);

    // Create a resource and method for the GET request
    const getStudentResource = studentApi.root.addResource('getStudentMarks');
    getStudentResource.addMethod('GET', getIntegration);

    // Lambda function to delete student marks based on student Id and subject
    const deleteStudentMarksLambda = new lambda.Function(this, 'DeleteStudentMarksFunction' + id, {
      functionName: 'DeleteStudentMarksFunction' + environment,
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'delete-student-marks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      environment: {
        TABLE_NAME: studentTable.tableName,
      },
      role: lambdaRole,
    });

    // Integrate the Delete Lambda function with the API Gateway
    const deleteIntegration = new apigateway.LambdaIntegration(deleteStudentMarksLambda);
    const deleteStudentResource = studentApi.root.addResource('deleteStudentMarks');
    deleteStudentResource.addMethod('DELETE', deleteIntegration);


  }
}

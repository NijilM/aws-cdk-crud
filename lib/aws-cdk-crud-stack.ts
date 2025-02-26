import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkCrudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('user', 'nijil');
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCdkCrudQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });


        // Define the DynamoDB table
      const studentTable =  new dynamodb.Table(this, 'StudentsTable', {
          partitionKey: { name: 'studentId', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'subjectName', type: dynamodb.AttributeType.STRING },
          tableName: 'Students',
          billingMode: dynamodb.BillingMode.PROVISIONED,
          readCapacity: 5,
          writeCapacity: 5,
          removalPolicy: cdk.RemovalPolicy.DESTROY, 
        });

 
  }
}

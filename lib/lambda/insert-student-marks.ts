import { Handler } from "aws-cdk-lib/aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);


exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('event received : ', event);


    let studentId: string, studentName: string, subjectName: string, marks: number;
    let response: any;

    try {
        ({ studentId, studentName, subjectName, marks } = getEventDetails(event));

        console.log('Student Name : ', studentName);

        const params = {
            TableName: process.env.TABLE_NAME!,
            Item: {
                studentId,
                studentName,
                subjectName,
                marks
            }
        };

        let dbResponse = await dynamoDb.send(new PutCommand(params));


        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Marks of the Student inserted successfully',
                response: dbResponse,
                "studentId": studentId,
                "studentName": studentName,
                "subject": subjectName,
                "marks": marks

            })
        };


    } catch (error) {
        console.error('Error occurred while inserting student mark', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error occurred while inserting student mark',
                error: error
            })
        };
    }

    return response;

    //Parsing the event
    function getEventDetails(event: APIGatewayProxyEvent) {
        try {
            const body = JSON.parse(event.body!);
            if (!body.studentId || !body.studentName || !body.subjectName || typeof body.marks !== 'number') {
                throw new Error('Invalid event parameters');
            }

            return {

                studentId: body.studentId,
                studentName: body.studentName,
                subjectName: body.subjectName,
                marks: body.marks
            };
        } catch (error) {
            console.error('Error occurred while parsing event', error);
            throw new Error('Error occurred while parsing event ' + error);

        }
    }
}


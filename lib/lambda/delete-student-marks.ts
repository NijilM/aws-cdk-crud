import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);


exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('event received : ', event);


    let studentId: string, subjectName: string;
    let response: any;

    try {
        ({ studentId, subjectName } = getEventDetails(event));

        console.log('Student Id : ', studentId);

        const params = {
            TableName: process.env.TABLE_NAME!,
            Key: {
                studentId: studentId,
                subjectName: subjectName,
            },
        };

        await dynamoDb.send(new DeleteCommand(params));


        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Student marks deleted successfully',
                studentId: studentId,
                subjectName: subjectName
            }),

        };


    } catch (error) {
        console.error('Error occurred while deleting the student marks', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error occurred while deleting the student marks',
                error: error instanceof Error ? error.message : String(error)
            })
        };
    }

    return response;

    //Parsing the event
    function getEventDetails(event: APIGatewayProxyEvent) {
        try {

            if (!event.queryStringParameters?.studentId || !event.queryStringParameters?.subjectName) {
                throw new Error('Invalid event parameters. Required parameters are studentId and subjectName');
            }

            return {
                studentId: event.queryStringParameters?.studentId,
                subjectName: event.queryStringParameters?.subjectName
            };
        } catch (error) {
            console.error('Error occurred while parsing event', error);
            throw new Error('Error occurred while parsing event ' + error);

        }
    }
}


import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);


exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('event received : ', event);


    let studentId: string;
    let response: any;

    try {
        ({ studentId } = getEventDetails(event));

        console.log('Student Id : ', studentId);

        const params = {
            TableName: process.env.TABLE_NAME!,
            KeyConditionExpression: 'studentId = :studentId',
            ExpressionAttributeValues: {
                ':studentId': studentId,
            },
        };


        let dbResponse = await dynamoDb.send(new QueryCommand(params));


        response = {
            statusCode: 200,
            body: JSON.stringify(dbResponse.Items),

        };


    } catch (error) {
        console.error('Error occurred while retrieving student marks', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error occurred while retrieving student marks',
                error: error
            })
        };
    }

    return response;

    //Parsing the event
    function getEventDetails(event: APIGatewayProxyEvent) {
        try {
            const studentId = event.queryStringParameters?.studentId;
            if (!studentId) {
                throw new Error('Invalid event parameters');
            }

            return {
                studentId: studentId
            };
        } catch (error) {
            console.error('Error occurred while parsing event', error);
            throw new Error('Error occurred while parsing event ' + error);

        }
    }
}


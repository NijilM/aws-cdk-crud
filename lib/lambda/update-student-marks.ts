import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);


exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('event received : ', event);

    let studentName: string, marks: number;
    const studentId = event.queryStringParameters?.studentId;
    const subjectName = event.queryStringParameters?.subjectName;


    let response: any;

    try {
        ({ marks, studentName } = getEventDetails(event));

        console.log('Student Id : ', studentId);

        const updateExpression = [];
        const expressionAttributeValues: { [key: string]: any } = {};

        if (marks !== undefined) {
            updateExpression.push('marks = :marks');
            expressionAttributeValues[':marks'] = marks;
        }

        if (studentName !== undefined) {
            updateExpression.push('studentName = :studentName');
            expressionAttributeValues[':studentName'] = studentName;
        }

        if (updateExpression.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No attributes to update' }),
            };
        }


        const params = {
            TableName: process.env.TABLE_NAME!,
            Key: {
                studentId: studentId,
                subjectName: subjectName,
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW' as const,
        };
        const dbResponse = await dynamoDb.send(new UpdateCommand(params));

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Student marks updated successfully',
                updatedAttributes: dbResponse.Attributes,
            }),

        };


    } catch (error) {
        console.error('Error occurred while updating the student details', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error occurred while updating the student marks',
                error: error instanceof Error ? error.message : String(error)
            })
        };
    }

    return response;

    //Parsing the event
    function getEventDetails(event: APIGatewayProxyEvent) {
        try {

            const body = JSON.parse(event.body!);
            if (!body.studentName || typeof body.marks !== 'number') {
                throw new Error('Invalid event parameters');
            }

            return {

                studentName: body.studentName,

                marks: body.marks
            };
        } catch (error) {
            console.error('Error occurred while parsing event', error);
            throw new Error('Error occurred while parsing event ' + error);

        }
    }
}


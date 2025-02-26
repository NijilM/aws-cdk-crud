import { Handler } from "aws-cdk-lib/aws-lambda"


exports.handler = async (event: any) => {

    console.log('event received : ', event);


    let studentId: string, studentName: string, subjectName: string, marks: number;

    try {
        ({ studentId, studentName, subjectName, marks } = getEventDetails(event));

        console.log('Student Name : ', studentName);
    } catch (error) {
        console.error('Error occurred while inserting student', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error occurred while inserting student',
                error: error
            })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Marks of the Student inserted successfully',
            "studentId": studentId,
            "studentName": studentName,
            "subject": subjectName,
            "marks": marks

        })
    };

    //Parsing the event
    function getEventDetails(event: any) {
        try {
            if (!event.studentId || !event.studentName || !event.subjectName || typeof event.marks !== 'number') {
                throw new Error('Invalid event parameters');
            }
            return {
                studentId: event.studentId,
                studentName: event.studentName,
                subjectName: event.subjectName,
                marks: event.marks
            };
        } catch (error) {
            console.error('Error occurred while parsing event', error);
            throw new Error('Error occurred while parsing event ' + error);

        }
    }
}


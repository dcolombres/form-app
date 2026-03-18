import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  const { formId } = await context.params;

  try {
    console.log('API Submit: Received formId:', formId);

    const { responses } = await request.json();
    console.log('API Submit: Received responses:', responses);

    if (!formId || !responses) {
      console.log('API Submit: Missing formId or responses, returning 400.');
      return NextResponse.json({ message: 'Form ID or responses missing' }, { status: 400 });
    }

    const submissionId = uuidv4();
    const formResponsesDir = path.join(process.cwd(), 'data', 'responses', formId);
    const filePath = path.join(formResponsesDir, `${submissionId}.json`);
    console.log('API Submit: Saving submission to:', filePath);

    // Ensure the directory exists
    await fs.mkdir(formResponsesDir, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(responses, null, 2));
    console.log('API Submit: Submission saved successfully:', submissionId);

    return NextResponse.json({ message: 'Form submitted successfully', submissionId });
  } catch (error) {
    console.error('API Submit: Error submitting form:', error);
    return NextResponse.json({ message: 'Error submitting form' }, { status: 500 });
  }
}

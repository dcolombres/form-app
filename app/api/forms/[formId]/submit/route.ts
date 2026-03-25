import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma Client

export async function POST(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;

    console.log('API Submit: Received formId:', formId);

    const { responses } = await request.json();
    console.log('API Submit: Received responses:', responses);

    if (!formId || !responses) {
      console.log('API Submit: Missing formId or responses, returning 400.');
      return NextResponse.json({ message: 'Form ID or responses missing' }, { status: 400 });
    }

    // Verify formId exists
    const formExists = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true }, // Only select the ID, no need for full form data
    });

    if (!formExists) {
      console.log(`API Submit: Form with ID ${formId} not found, returning 404.`);
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const newResponse = await prisma.response.create({
      data: {
        formId: formId,
        data: responses, // Store the entire responses object as JSON
      },
    });

    console.log('API Submit: Submission saved successfully:', newResponse.id);

    return NextResponse.json({ message: 'Form submitted successfully', submissionId: newResponse.id });
  } catch (error: any) { // Explicitly type error as 'any' for now to access properties
    console.error('API Submit: Error submitting form to DB:', error.message || error);
    // Log the full error object for more details
    console.error('API Submit: Full error object:', error);
    return NextResponse.json({ message: 'Error submitting form', error: error.message || 'Unknown error' }, { status: 500 });
  }
}

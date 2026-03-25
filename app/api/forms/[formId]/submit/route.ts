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

    const newResponse = await prisma.response.create({
      data: {
        formId: formId,
        data: responses, // Store the entire responses object as JSON
      },
    });

    console.log('API Submit: Submission saved successfully:', newResponse.id);

    return NextResponse.json({ message: 'Form submitted successfully', submissionId: newResponse.id });
  } catch (error) {
    console.error('API Submit: Error submitting form to DB:', error);
    return NextResponse.json({ message: 'Error submitting form' }, { status: 500 });
  }
}

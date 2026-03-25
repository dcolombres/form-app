import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma Client

export async function GET(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;

    const responses = await prisma.response.findMany({
      where: { formId: formId },
      select: { data: true }, // Only select the JSON data of the response
    });

    // Extract the 'data' object from each response
    const responseData = responses.map((r: { data: any }) => r.data);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching responses from DB:', error);
    return NextResponse.json({ message: 'Error al cargar las respuestas.' }, { status: 500 });
  }
}

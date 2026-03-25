import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma Client

export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        questions: true, // Include questions related to each form
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms from DB:', error);
    return NextResponse.json({ message: 'Error al cargar los formularios.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, title, questions } = await request.json();

    if (!id || !title || !questions) {
      return NextResponse.json({ message: 'Faltan datos del formulario (id, title, questions).' }, { status: 400 });
    }

    const newForm = await prisma.form.create({
      data: {
        id,
        title,
        questions: {
          create: questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options || [],
            fixed: q.fixed || false,
          })),
        },
      },
      include: {
        questions: true, // Return the created form with its questions
      },
    });

    return NextResponse.json({ message: 'Formulario guardado exitosamente', formId: newForm.id });
  } catch (error) {
    console.error('Error saving form to DB:', error);
    return NextResponse.json({ message: 'Error al guardar el formulario.' }, { status: 500 });
  }
}


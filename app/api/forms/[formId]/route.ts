import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma Client
import { PrismaClient } from '@prisma/client'; // Import PrismaClient type

export async function GET(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });

    if (!form) {
      return NextResponse.json({ message: 'Formulario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form from DB:', error);
    return NextResponse.json({ message: 'Error al obtener el formulario.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;
    const { title, questions } = await request.json();

    if (!formId || !title || !questions) {
      return NextResponse.json({ message: 'Faltan datos del formulario (id, title, questions).' }, { status: 400 });
    }

    // Use a transaction to update the form and its questions
    const updatedForm = await prisma.$transaction(async (tx: PrismaClient) => {
      // 1. Update the form's title
      const form = await tx.form.update({
        where: { id: formId },
        data: { title },
      });

      // 2. Delete all existing questions for this form
      await tx.question.deleteMany({
        where: { formId: formId },
      });

      // 3. Create new questions
      await tx.question.createMany({
        data: questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options || [],
          fixed: q.fixed || false,
          formId: formId,
        })),
      });

      return form;
    });

    return NextResponse.json({ message: 'Formulario actualizado exitosamente', formId: updatedForm.id });
  } catch (error) {
    console.error('Error updating form in DB:', error);
    return NextResponse.json({ message: 'Error al actualizar el formulario.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;

    const deletedForm = await prisma.form.delete({
      where: { id: formId },
    });

    if (!deletedForm) {
      return NextResponse.json({ message: 'Formulario no encontrado para eliminar' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Formulario y sus datos asociados eliminados exitosamente' });
  } catch (error) {
    console.error('Error deleting form from DB:', error);
    return NextResponse.json({ message: 'Error al eliminar el formulario.' }, { status: 500 });
  }
}
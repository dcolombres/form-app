import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;
    const filePath = path.join(process.cwd(), 'data', 'forms', `${formId}.json`);
    console.log(`Attempting to read form file: ${filePath}`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const form = JSON.parse(fileContent);
      return NextResponse.json(form);
    } catch (readError) {
      console.error(`Error reading file ${filePath}:`, readError);
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ message: 'Formulario no encontrado' }, { status: 404 });
      }
      throw readError;
    }
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ message: 'Error al obtener el formulario' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;
    const updatedFormDefinition = await request.json();

    if (!formId || formId !== updatedFormDefinition.id) {
      return NextResponse.json({ message: 'ID de formulario no coincide o falta' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'forms', `${formId}.json`);

    // Ensure the form exists before updating
    try {
      await fs.access(filePath);
    } catch (accessError) {
      if ((accessError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ message: 'Formulario no encontrado para actualizar' }, { status: 404 });
      }
      throw accessError;
    }

    await fs.writeFile(filePath, JSON.stringify(updatedFormDefinition, null, 2));
    return NextResponse.json({ message: 'Formulario actualizado exitosamente', formId: updatedFormDefinition.id });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ message: 'Error al actualizar el formulario' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  try {
    const resolvedParams = await context.params;
    const { formId } = resolvedParams;
    const filePath = path.join(process.cwd(), 'data', 'forms', `${formId}.json`);
    const responsesDirectory = path.join(process.cwd(), 'data', 'responses', formId);

    // Delete form file
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      if ((unlinkError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ message: 'Formulario no encontrado para eliminar' }, { status: 404 });
      }
      throw unlinkError;
    }

    // Delete associated responses directory if it exists
    try {
      await fs.rm(responsesDirectory, { recursive: true, force: true });
    } catch (rmError) {
      console.warn(`No se pudieron eliminar las respuestas para el formulario ${formId} (puede que no existieran):`, rmError);
    }

    return NextResponse.json({ message: 'Formulario y sus respuestas eliminados exitosamente' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ message: 'Error al eliminar el formulario' }, { status: 500 });
  }
}
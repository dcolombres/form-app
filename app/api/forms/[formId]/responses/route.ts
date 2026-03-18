import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, context: { params: Promise<{ formId: string }> | { formId: string } }) {
  const resolvedParams = await context.params;
  const { formId } = resolvedParams;

  try {
    const formResponsesDir = path.join(process.cwd(), 'data', 'responses', formId);

    // Check if the directory exists
    try {
      await fs.access(formResponsesDir);
    } catch (error) {
      // If directory does not exist, no responses yet
      return NextResponse.json([]);
    }

    const filenames = await fs.readdir(formResponsesDir);

    const responses = await Promise.all(filenames.map(async (filename) => {
      const filePath = path.join(formResponsesDir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ message: 'Error fetching responses' }, { status: 500 });
  }
}

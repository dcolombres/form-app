import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const formsDirectory = path.join(process.cwd(), 'data', 'forms');
    console.log('Attempting to read forms from directory:', formsDirectory);

    let filenames: string[] = [];
    try {
      filenames = await fs.readdir(formsDirectory);
      console.log('Found filenames:', filenames);
    } catch (readDirError) {
      if ((readDirError as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('Forms directory not found, returning empty array.');
        return NextResponse.json([]);
      }
      throw readDirError; // Re-throw other errors
    }

    const forms = await Promise.all(filenames.map(async (filename) => {
      const filePath = path.join(formsDirectory, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      console.log(`Content of ${filename}:`, fileContent);
      return JSON.parse(fileContent);
    }));

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ message: 'Error fetching forms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formDefinition = await request.json();
    const formId = formDefinition.id; // Assuming formDefinition already has an ID

    if (!formId) {
      return NextResponse.json({ message: 'Form ID is missing' }, { status: 400 });
    }

    // Add createdAt timestamp
    const formToSave = {
      ...formDefinition,
      createdAt: new Date().toISOString(),
    };

    const formsDirectory = path.join(process.cwd(), 'data', 'forms');
    const filePath = path.join(formsDirectory, `${formId}.json`);
    console.log('Attempting to save form to:', filePath);

    // Ensure the directory exists
    await fs.mkdir(formsDirectory, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(formToSave, null, 2));
    console.log('Form saved successfully:', formId);

    return NextResponse.json({ message: 'Form saved successfully', formId });
  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json({ message: 'Error saving form' }, { status: 500 });
  }
}


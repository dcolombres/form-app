import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const responsesBaseDirectory = path.join(process.cwd(), 'data', 'responses');
    let totalResponses = 0;

    try {
      const formResponseDirectories = await fs.readdir(responsesBaseDirectory, { withFileTypes: true });

      for (const dirent of formResponseDirectories) {
        if (dirent.isDirectory()) {
          const formResponsesPath = path.join(responsesBaseDirectory, dirent.name);
          const responseFiles = await fs.readdir(formResponsesPath);
          totalResponses += responseFiles.filter(file => file.endsWith('.json')).length;
        }
      }
    } catch (readDirError) {
      if ((readDirError as NodeJS.ErrnoException).code === 'ENOENT') {
        // If the responses directory doesn't exist, there are no responses
        return NextResponse.json({ totalResponses: 0 });
      }
      throw readDirError; // Re-throw other errors
    }

    return NextResponse.json({ totalResponses });
  } catch (error) {
    console.error('Error counting total responses:', error);
    return NextResponse.json({ message: 'Error al contar las respuestas totales' }, { status: 500 });
  }
}

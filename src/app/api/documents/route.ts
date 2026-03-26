import {
  listDocuments,
  createDocument,
} from '@/services/documentService';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const docs = listDocuments();
  return Response.json(docs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const doc = createDocument({
    documentId: uuidv4(),
    title: body.title || 'Untitled',
    content: body.content || '',
    language: body.language || 'javascript',
    ownerId: body.ownerId || 'anonymous',
  });
  return Response.json(doc, { status: 201 });
}

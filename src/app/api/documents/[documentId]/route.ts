import {
  getDocument,
  updateDocument,
  deleteDocument,
} from '@/services/documentService';
import { serverEventService } from '@/services/serverEventService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const doc = getDocument(documentId);
  if (!doc) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }
  return Response.json(doc);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const body = await request.json();
  const updated = updateDocument(documentId, {
    content: body.content,
    title: body.title,
    language: body.language,
  });

  if (!updated) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  // Publish real-time event
  serverEventService.publish({
    type: 'update',
    documentId,
    content: updated.content,
    userId: body.userId || 'anonymous',
    timestamp: new Date().toISOString(),
  });

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const deleted = deleteDocument(documentId);
  if (!deleted) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}

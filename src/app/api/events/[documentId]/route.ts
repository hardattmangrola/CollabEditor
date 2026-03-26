import { serverEventService } from '@/services/serverEventService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const url = new URL(request.url);
  const since = url.searchParams.get('since') ?? undefined;
  const events = serverEventService.getRecentEvents(documentId, since);
  return Response.json(events);
}

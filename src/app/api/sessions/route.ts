import { joinSession, leaveSession, getActiveUsers } from '@/services/sessionService';
import { serverEventService } from '@/services/serverEventService';
import { User } from '@/types';

export async function POST(request: Request) {
  const body = await request.json();
  const { action, documentId, user } = body as {
    action: 'join' | 'leave' | 'getUsers';
    documentId: string;
    user?: User;
  };

  if (action === 'join' && user) {
    const session = joinSession(documentId, user);
    serverEventService.publish({
      type: 'join',
      documentId,
      userId: user.userId,
      timestamp: new Date().toISOString(),
    });
    return Response.json(session);
  }

  if (action === 'leave' && user) {
    const session = leaveSession(documentId, user.userId);
    serverEventService.publish({
      type: 'leave',
      documentId,
      userId: user.userId,
      timestamp: new Date().toISOString(),
    });
    return Response.json(session ?? { documentId, activeUsers: [] });
  }

  if (action === 'getUsers') {
    const users = getActiveUsers(documentId);
    return Response.json({ activeUsers: users });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

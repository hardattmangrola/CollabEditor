import { Session, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory session store (simulates DynamoDB Sessions table)
const sessions: Map<string, Session> = new Map();

export function getSession(documentId: string): Session | undefined {
  for (const session of sessions.values()) {
    if (session.documentId === documentId) {
      return session;
    }
  }
  return undefined;
}

export function joinSession(documentId: string, user: User): Session {
  let session = getSession(documentId);

  if (!session) {
    session = {
      sessionId: uuidv4(),
      documentId,
      activeUsers: [],
    };
  }

  // Don't add duplicate users
  if (!session.activeUsers.find((u) => u.userId === user.userId)) {
    session.activeUsers.push(user);
  }

  sessions.set(session.sessionId, session);
  return session;
}

export function leaveSession(documentId: string, userId: string): Session | undefined {
  const session = getSession(documentId);
  if (!session) return undefined;

  session.activeUsers = session.activeUsers.filter((u) => u.userId !== userId);

  if (session.activeUsers.length === 0) {
    sessions.delete(session.sessionId);
    return undefined;
  }

  sessions.set(session.sessionId, session);
  return session;
}

export function getActiveUsers(documentId: string): User[] {
  const session = getSession(documentId);
  return session?.activeUsers ?? [];
}

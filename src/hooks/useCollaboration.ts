'use client';

import { useState, useEffect, useCallback } from 'react';
import { CollaborationEvent, User } from '@/types';
import { callAppSync } from '@/services/appsyncService';
import { joinSession, leaveSession } from '@/graphql/mutations';
import { getSessionUsers } from '@/graphql/queries';

function toUserArray(value: unknown): User[] {
  if (!value || typeof value !== 'object') return [];
  const maybeActiveUsers = (value as { activeUsers?: unknown }).activeUsers;
  if (!Array.isArray(maybeActiveUsers)) return [];
  return maybeActiveUsers
    .filter((u): u is Record<string, unknown> => !!u && typeof u === 'object')
    .map((u) => ({
      userId: String(u.userId || ''),
      email: String(u.email || 'unknown@user.com'),
      displayName: String(u.displayName || u.email || 'User'),
      avatarColor: String(u.avatarColor || '#6366f1'),
    }))
    .filter((u) => !!u.userId);
}

export function useCollaboration(documentId: string | undefined, currentUser: User | null) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [lastEvent, setLastEvent] = useState<CollaborationEvent | null>(null);

  const currentUserId = currentUser?.userId;
  const currentUserToken = currentUser?.token;
  const currentUserEmail = currentUser?.email;
  const currentUserDisplayName = currentUser?.displayName;
  const currentUserAvatarColor = currentUser?.avatarColor;

  const fetchRemoteUsers = useCallback(async () => {
    if (!documentId || !currentUserToken || !currentUserId) return;
    try {
      const data = await callAppSync<{ getSessionUsers?: unknown }>(
        getSessionUsers,
        { documentId },
        currentUserToken
      );
      const users = toUserArray(data.getSessionUsers);
      if (users.length > 0) {
        setActiveUsers(users);
      } else {
        setActiveUsers([{
          userId: currentUserId,
          email: currentUserEmail || 'unknown@user.com',
          displayName: currentUserDisplayName || 'User',
          avatarColor: currentUserAvatarColor || '#6366f1',
          token: currentUserToken,
        }]);
      }
    } catch {
      setActiveUsers([{
        userId: currentUserId,
        email: currentUserEmail || 'unknown@user.com',
        displayName: currentUserDisplayName || 'User',
        avatarColor: currentUserAvatarColor || '#6366f1',
        token: currentUserToken,
      }]);
    }
  }, [documentId, currentUserToken, currentUserId, currentUserEmail, currentUserDisplayName, currentUserAvatarColor]);

  // Join/leave AppSync-backed session and poll users from AWS.
  useEffect(() => {
    if (!documentId || !currentUserToken || !currentUserId) {
      setActiveUsers([]);
      return;
    }

    let disposed = false;

    const join = async () => {
      try {
        const data = await callAppSync<{ joinSession?: unknown }>(
          joinSession,
          {
            documentId,
            userId: currentUserId,
            email: currentUserEmail || 'unknown@user.com',
            displayName: currentUserDisplayName || 'User',
            avatarColor: currentUserAvatarColor || '#6366f1',
          },
          currentUserToken
        );
        if (disposed) return;
        const users = toUserArray(data.joinSession);
        setActiveUsers(
          users.length > 0
            ? users
            : [{
                userId: currentUserId,
                email: currentUserEmail || 'unknown@user.com',
                displayName: currentUserDisplayName || 'User',
                avatarColor: currentUserAvatarColor || '#6366f1',
                token: currentUserToken,
              }]
        );
      } catch {
        if (!disposed) {
          setActiveUsers([{
            userId: currentUserId,
            email: currentUserEmail || 'unknown@user.com',
            displayName: currentUserDisplayName || 'User',
            avatarColor: currentUserAvatarColor || '#6366f1',
            token: currentUserToken,
          }]);
        }
      }
    };

    join();
    setActiveUsers([{
      userId: currentUserId,
      email: currentUserEmail || 'unknown@user.com',
      displayName: currentUserDisplayName || 'User',
      avatarColor: currentUserAvatarColor || '#6366f1',
      token: currentUserToken,
    }]);
    setLastEvent(null);

    const interval = setInterval(() => {
      fetchRemoteUsers();
    }, 3000);

    return () => {
      disposed = true;
      clearInterval(interval);
      void callAppSync(
        leaveSession,
        { documentId, userId: currentUserId },
        currentUserToken
      ).catch(() => {});
    };
  }, [
    documentId,
    currentUserId,
    currentUserToken,
    currentUserEmail,
    currentUserDisplayName,
    currentUserAvatarColor,
    fetchRemoteUsers,
  ]);

  const publishCursor = useCallback(
    (lineNumber: number, column: number) => {
      if (!documentId || !currentUser) return;
      // For future use — cursor sharing
      void lineNumber;
      void column;
    },
    [documentId, currentUser]
  );

  return { activeUsers, lastEvent, publishCursor };
}

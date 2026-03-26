'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { callAppSync } from '@/services/appsyncService';
import { listDocuments, getSessionUsers } from '@/graphql/queries';
import { createDocument, joinSession, leaveSession } from '@/graphql/mutations';
import { v4 as uuidv4 } from 'uuid';

function decodeJwtClaims(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function TestAwsPage() {
  const { user } = useAuth();
  const [documentId, setDocumentId] = useState('');
  const [log, setLog] = useState('Ready.');

  const claims = useMemo(() => (user?.token ? decodeJwtClaims(user.token) : null), [user?.token]);

  const append = (title: string, payload: unknown) => {
    setLog((prev) => `${prev}\n\n=== ${title} ===\n${JSON.stringify(payload, null, 2)}`);
  };

  const requireAuth = () => {
    if (!user?.token) {
      append('AUTH ERROR', { message: 'No token. Please sign in first.' });
      return false;
    }
    return true;
  };

  const handleListDocuments = async () => {
    if (!requireAuth()) return;
    try {
      const data = await callAppSync<{ listDocuments: unknown }>(listDocuments, {}, user!.token!);
      append('LIST DOCUMENTS SUCCESS', data);
    } catch (err) {
      append('LIST DOCUMENTS ERROR', err);
    }
  };

  const handleCreateDocument = async () => {
    if (!requireAuth()) return;
    try {
      const id = uuidv4();
      const data = await callAppSync<{ createDocument: unknown }>(
        createDocument,
        {
          id,
          title: `Dummy-${id.slice(0, 8)}.js`,
          language: 'javascript',
          ownerId: user!.userId,
        },
        user!.token!
      );
      setDocumentId(id);
      append('CREATE DOCUMENT SUCCESS', data);
    } catch (err) {
      append('CREATE DOCUMENT ERROR', err);
    }
  };

  const handleJoinSession = async () => {
    if (!requireAuth() || !documentId.trim()) return;
    try {
      const data = await callAppSync<{ joinSession: unknown }>(
        joinSession,
        {
          documentId,
          userId: user!.userId,
          email: user!.email,
          displayName: user!.displayName,
          avatarColor: user!.avatarColor,
        },
        user!.token!
      );
      append('JOIN SESSION SUCCESS', data);
    } catch (err) {
      append('JOIN SESSION ERROR', err);
    }
  };

  const handleGetSessionUsers = async () => {
    if (!requireAuth() || !documentId.trim()) return;
    try {
      const data = await callAppSync<{ getSessionUsers: unknown }>(
        getSessionUsers,
        { documentId },
        user!.token!
      );
      append('GET SESSION USERS SUCCESS', data);
    } catch (err) {
      append('GET SESSION USERS ERROR', err);
    }
  };

  const handleLeaveSession = async () => {
    if (!requireAuth() || !documentId.trim()) return;
    try {
      const data = await callAppSync<{ leaveSession: unknown }>(
        leaveSession,
        { documentId, userId: user!.userId },
        user!.token!
      );
      append('LEAVE SESSION SUCCESS', data);
    } catch (err) {
      append('LEAVE SESSION ERROR', err);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem', color: 'white' }}>
      <h1>AWS Direct Test Page</h1>
      <p>Use this page to test AppSync operations directly.</p>

      <div style={{ margin: '1rem 0', padding: '0.75rem', background: '#111827', borderRadius: 8 }}>
        <div><strong>Signed in:</strong> {user ? 'Yes' : 'No'}</div>
        <div><strong>User ID:</strong> {user?.userId || '-'}</div>
        <div><strong>Token issuer:</strong> {String(claims?.iss || '-')}</div>
        <div><strong>Token audience:</strong> {String(claims?.aud || claims?.client_id || '-')}</div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button onClick={handleListDocuments}>List Documents</button>
        <button onClick={handleCreateDocument}>Create Dummy Document</button>
        <button onClick={handleJoinSession}>Join Session</button>
        <button onClick={handleGetSessionUsers}>Get Session Users</button>
        <button onClick={handleLeaveSession}>Leave Session</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="doc-id-input"><strong>Document ID for session tests</strong></label>
        <input
          id="doc-id-input"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          placeholder="Paste or create document ID"
          style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }}
        />
      </div>

      <pre style={{ whiteSpace: 'pre-wrap', background: '#0b1020', padding: '1rem', borderRadius: 8 }}>
        {log}
      </pre>
    </div>
  );
}


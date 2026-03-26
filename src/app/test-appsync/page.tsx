'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createDocument } from '@/graphql/mutations';
import { v4 as uuidv4 } from 'uuid';
import { AppSyncRequestError, callAppSync } from '@/services/appsyncService';

function decodeJwtClaims(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function TestAppSyncPage() {
  const { user } = useAuth();
  const [log, setLog] = useState<string>('');

  const runTest = async () => {
    if (!user?.token) {
      setLog('Error: No authentication token found. Are you logged in?');
      return;
    }

    try {
      const claims = decodeJwtClaims(user.token);
      setLog(
        'Sending dummy document to AppSync...\n' +
        `Token issuer: ${String(claims?.iss || 'unknown')}\n` +
        `Token audience: ${String(claims?.aud || claims?.client_id || 'unknown')}`
      );
      const id = uuidv4();
      const variables = {
        id,
        title: 'AppSync Connectivity Test',
        language: 'plaintext',
        ownerId: user.userId,
      };
      const result = await callAppSync<{ createDocument: unknown }>(createDocument, variables, user.token);

      setLog(prev => prev + '\n\nSuccess! Response:\n' + JSON.stringify(result, null, 2));
    } catch (err) {
      if (err instanceof AppSyncRequestError) {
        setLog(
          (prev) =>
            prev +
            '\n\nFailed! Error:\n' +
            JSON.stringify(
              {
                name: err.name,
                message: err.message,
                status: err.status,
                payload: err.payload,
              },
              null,
              2
            )
        );
      } else if (err instanceof Error) {
        setLog(
          (prev) =>
            prev +
            '\n\nFailed! Error:\n' +
            JSON.stringify(
              {
                name: err.name,
                message: err.message,
              },
              null,
              2
            )
        );
      } else {
        setLog(prev => prev + '\n\nFailed! Error:\n' + JSON.stringify(err, null, 2));
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <h1>AWS AppSync Connectivity Test</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Status:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
        <p><strong>User ID:</strong> {user?.userId}</p>
      </div>

      <button 
        onClick={runTest}
        style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
      >
        Send Dummy Data
      </button>

      <pre style={{ marginTop: '2rem', padding: '1rem', background: '#1e1e1e', borderRadius: '4px', overflowX: 'auto' }}>
        {log || 'Click the button to test connection...'}
      </pre>
    </div>
  );
}

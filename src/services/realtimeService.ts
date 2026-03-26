'use client';

import { CollaborationEvent } from '@/types';
import { onUpdateDocument } from '@/graphql/subscriptions';
import { Document } from '@/types';
import { getGraphqlClient } from '@/lib/amplify';

type DocumentCallback = (doc: Document) => void;
type CollabCallback = (event: CollaborationEvent) => void;

const client = getGraphqlClient();
const ENABLE_APPSYNC_SUBSCRIPTIONS = false;

// Manages AppSync real-time subscriptions for document updates
class RealtimeService {
  private docSubscribers: Map<string, Set<DocumentCallback>> = new Map();
  private collabSubscribers: Map<string, Set<CollabCallback>> = new Map();
  private activeSubscriptions: Map<string, { unsubscribe: () => void }> = new Map();
  private disabledDocuments: Set<string> = new Set();

  // Subscribe to real-time document updates via AppSync WebSocket
  subscribeToDocument(documentId: string, callback: DocumentCallback, authToken?: string): () => void {
    if (!this.docSubscribers.has(documentId)) {
      this.docSubscribers.set(documentId, new Set());
    }
    this.docSubscribers.get(documentId)!.add(callback);

    // Start AppSync subscription if not already active for this document
    if (
      ENABLE_APPSYNC_SUBSCRIPTIONS &&
      !this.activeSubscriptions.has(documentId) &&
      !this.disabledDocuments.has(documentId) &&
      authToken
    ) {
      this.startAppSyncSubscription(documentId, authToken);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.docSubscribers.get(documentId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.docSubscribers.delete(documentId);
          this.stopAppSyncSubscription(documentId);
        }
      }
    };
  }

  // Legacy collaboration event subscriber (for cursor tracking etc.)
  subscribe(documentId: string, callback: CollabCallback): () => void {
    if (!this.collabSubscribers.has(documentId)) {
      this.collabSubscribers.set(documentId, new Set());
    }
    this.collabSubscribers.get(documentId)!.add(callback);

    return () => {
      const subs = this.collabSubscribers.get(documentId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.collabSubscribers.delete(documentId);
        }
      }
    };
  }

  // Publish a collaboration event locally (for cursor tracking, join/leave)
  publish(event: CollaborationEvent): void {
    const subs = this.collabSubscribers.get(event.documentId);
    if (subs) {
      subs.forEach((callback) => callback(event));
    }
  }

  private startAppSyncSubscription(documentId: string, authToken: string) {
    try {
      const sub = client.graphql({
        query: onUpdateDocument,
        variables: { id: documentId },
        authMode: 'userPool',
        authToken
      });

      // sub is an Observable — subscribe to it
      const subscription = (sub as unknown as { subscribe: (handlers: { next: (value: { data: { onUpdateDocument: Record<string, unknown> } }) => void; error: (err: unknown) => void }) => { unsubscribe: () => void } }).subscribe({
        next: (value) => {
          const raw = value.data.onUpdateDocument;
          if (raw) {
            const doc: Document = {
              documentId: raw.id as string,
              title: (raw.title as string) || 'Untitled',
              content: (raw.content as string) || '',
              language: (raw.language as string) || 'javascript',
              ownerId: (raw.ownerId as string) || '',
              createdAt: (raw.createdAt as string) || '',
              updatedAt: (raw.updatedAt as string) || '',
            };

            // Notify all document subscribers
            const callbacks = this.docSubscribers.get(documentId);
            if (callbacks) {
              callbacks.forEach((cb) => cb(doc));
            }

            // Also emit as a collaboration event for backward compatibility
            const collabEvent: CollaborationEvent = {
              type: 'update',
              documentId,
              content: doc.content,
              userId: doc.ownerId,
              timestamp: doc.updatedAt,
            };
            this.publish(collabEvent);
          }
        },
        error: (err: unknown) => {
          const details = err instanceof Error
            ? { name: err.name, message: err.message }
            : err;
          console.error('AppSync subscription error:', details);

          const maybeErrors = (details as { errors?: Array<{ message?: string }> }).errors;
          const firstMessage = maybeErrors?.[0]?.message || '';
          if (firstMessage.includes('Connection failed')) {
            this.disabledDocuments.add(documentId);
            this.stopAppSyncSubscription(documentId);
            console.warn(`Disabled AppSync subscription for document ${documentId}; falling back to polling.`);
          }
        },
      });

      this.activeSubscriptions.set(documentId, subscription);
    } catch (err) {
      const details = err instanceof Error
        ? { name: err.name, message: err.message }
        : err;
      console.error('Failed to start AppSync subscription:', details);
    }
  }

  private stopAppSyncSubscription(documentId: string) {
    const sub = this.activeSubscriptions.get(documentId);
    if (sub) {
      sub.unsubscribe();
      this.activeSubscriptions.delete(documentId);
    }
  }

  getRecentEvents(_documentId: string, _since?: string): CollaborationEvent[] {
    // AppSync handles history via queries — this is now a no-op for local events
    return [];
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

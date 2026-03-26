import { EventEmitter } from 'events';
import { CollaborationEvent } from '@/types';

class ServerEventService extends EventEmitter {
  private eventHistory: Map<string, CollaborationEvent[]> = new Map();
  private readonly MAX_HISTORY = 100;

  publish(event: CollaborationEvent) {
    if (!this.eventHistory.has(event.documentId)) {
      this.eventHistory.set(event.documentId, []);
    }
    const history = this.eventHistory.get(event.documentId)!;
    history.push(event);
    if (history.length > this.MAX_HISTORY) {
      history.shift();
    }
    this.emit(`doc:${event.documentId}`, event);
  }

  getRecentEvents(documentId: string, since?: string): CollaborationEvent[] {
    const history = this.eventHistory.get(documentId) || [];
    if (!since) return history;
    
    // The client sends the exact timestamp of the last event it saw.
    // We only want events strictly AFTER that time.
    const sinceTime = new Date(since).getTime();
    return history.filter(e => new Date(e.timestamp).getTime() > sinceTime);
  }
}

// Singleton instance for server-side API routes
export const serverEventService = new ServerEventService();

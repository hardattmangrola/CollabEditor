'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Document } from '@/types';
import { getDocument as getDocumentQuery, listDocuments as listDocumentsQuery } from '@/graphql/queries';
import {
  createDocument as createDocumentMutation,
  updateDocument as updateDocumentMutation,
  deleteDocument as deleteDocumentMutation,
} from '@/graphql/mutations';
import { v4 as uuidv4 } from 'uuid';
import { AppSyncRequestError, callAppSync } from '@/services/appsyncService';

function mapDoc(raw: Record<string, unknown>): Document {
  return {
    documentId: raw.id as string,
    title: (raw.title as string) || 'Untitled',
    content: (raw.content as string) || '',
    language: (raw.language as string) || 'javascript',
    ownerId: (raw.ownerId as string) || '',
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) || new Date().toISOString(),
  };
}

export function useDocument(documentId?: string) {
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async (docId: string, options?: { background?: boolean }) => {
    const isBackground = options?.background === true;
    if (!isBackground) {
      setIsLoading(true);
      setError(null);
    }
    try {
      if (!user?.token) {
        throw new Error('Authentication token missing. Please sign in again.');
      }
      const data = await callAppSync<{ getDocument: Record<string, unknown> }>(
        getDocumentQuery,
        { id: docId },
        user.token
      );
      const raw = data.getDocument;
      if (raw) {
        setDocument(mapDoc(raw));
      } else {
        if (!isBackground) setError('Document not found');
      }
    } catch (err) {
      if (!isBackground) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      }
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }, [user?.token]);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user?.token) {
        throw new Error('Authentication token missing. Please sign in again.');
      }
      const data = await callAppSync<{ listDocuments: Record<string, unknown>[] }>(
        listDocumentsQuery,
        {},
        user.token
      );
      const raw = data.listDocuments as unknown;
      let list: Record<string, unknown>[] = [];
      if (Array.isArray(raw)) {
        list = raw as Record<string, unknown>[];
      } else if (
        raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { items?: unknown[] }).items)
      ) {
        list = ((raw as { items: unknown[] }).items.filter(Boolean) as Record<string, unknown>[]);
      }

      const mapped = list.map(mapDoc);
      const strictUserDocs = mapped.filter((doc) => !user?.userId || doc.ownerId === user.userId);
      const docs = strictUserDocs.length > 0 ? strictUserDocs : mapped;
      docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  const saveContent = useCallback(
    async (content: string) => {
      if (!documentId || !user?.token) {
        setError('Authentication token missing. Please sign in again.');
        return false;
      }
      setIsSaving(true);
      try {
        const data = await callAppSync<{ updateDocument: Record<string, unknown> | null }>(
          updateDocumentMutation,
          { id: documentId, content },
          user.token
        );
        if (!data.updateDocument) {
          throw new Error('Update failed: updateDocument returned null');
        }
        setDocument((prev) =>
          prev ? { ...prev, content, updatedAt: new Date().toISOString() } : prev
        );
        setDocuments((prev) =>
          prev
            .map((doc) =>
              doc.documentId === documentId
                ? { ...doc, content, updatedAt: new Date().toISOString() }
                : doc
            )
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
        return true;
      } catch (err) {
        if (err instanceof AppSyncRequestError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to update document');
        }
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, user?.token]
  );

  const createDoc = useCallback(
    async (title: string, language: string, ownerId: string) => {
      if (!user?.token) {
        setError('Authentication token missing. Please sign in again.');
        return null;
      }
      setIsLoading(true);
      try {
        const id = uuidv4();
        const data = await callAppSync<{ createDocument: Record<string, unknown> }>(
          createDocumentMutation,
          { id, title, language, ownerId },
          user.token
        );
        const raw = data.createDocument;
        const newDoc = mapDoc(raw);
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.documentId !== newDoc.documentId)]);
        return newDoc;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create document');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.token]
  );

  const deleteDoc = useCallback(async (docId: string) => {
    try {
      if (!user?.token) return false;
      await callAppSync(deleteDocumentMutation, { id: docId }, user.token);
      setDocuments((prev) => prev.filter((d) => d.documentId !== docId));
      return true;
    } catch {
      return false;
    }
  }, [user?.token]);

  useEffect(() => {
    // Only fetch when we have a token, or if we explicitly don't need one
    if (documentId && user?.token) fetchDocument(documentId);
  }, [documentId, fetchDocument, user?.token]);

  return {
    document,
    documents,
    isLoading,
    isSaving,
    error,
    fetchDocument,
    fetchDocuments,
    saveContent,
    createDoc,
    deleteDoc,
    setDocument,
  };
}

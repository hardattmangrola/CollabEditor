'use client';

import { use, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useDocument } from '@/hooks/useDocument';
import { useCollaboration } from '@/hooks/useCollaboration';
import { updateDocument as updateDocumentMutation } from '@/graphql/mutations';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import UserPresence from '@/components/UserPresence';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Loader2, Terminal, Play, X } from 'lucide-react';
import { executeCode, ExecuteResult } from '@/services/executeService';
import { callAppSync } from '@/services/appsyncService';

export default function EditorPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    document: doc,
    documents,
    isLoading,
    isSaving,
    saveContent,
    setDocument,
    fetchDocument,
    fetchDocuments,
    createDoc,
    deleteDoc,
  } = useDocument(documentId);

  const { activeUsers } = useCollaboration(documentId, user);
  const [localContent, setLocalContent] = useState('');
  const localContentRef = useRef('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Execution Panel State
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');
  const [executeInput, setExecuteInput] = useState('');
  const [executeOutput, setExecuteOutput] = useState<ExecuteResult | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [isAuthenticated, fetchDocuments]);

  // Sync document content to local state
  useEffect(() => {
    if (doc) {
      setLocalContent(doc.content);
      localContentRef.current = doc.content;
      setHasUnsavedChanges(false);
    }
  }, [doc]);

  // AppSync-only realtime: poll the remote document state.
  useEffect(() => {
    if (!documentId || !user?.token) return;
    const interval = setInterval(() => {
      // Do not overwrite local unsaved edits.
      if (!hasUnsavedChanges) {
        fetchDocument(documentId, { background: true });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [documentId, user?.token, fetchDocument, hasUnsavedChanges]);

  const handleChange = useCallback(
    (value: string) => {
      setLocalContent(value);
      localContentRef.current = value;
      setHasUnsavedChanges(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    const saved = await saveContent(localContentRef.current);
    if (saved) {
      setHasUnsavedChanges(false);
      await fetchDocuments();
    }
  }, [saveContent, fetchDocuments]);

  const handleLanguageChange = useCallback(
    async (language: string) => {
      if (!user?.token) return;
      const data = await callAppSync<{ updateDocument: Record<string, unknown> | null }>(
        updateDocumentMutation,
        { id: documentId, language },
        user.token
      );
      if (data.updateDocument) {
        setDocument((prev) =>
          prev
            ? {
                ...prev,
                language: (data.updateDocument?.language as string) || language,
                updatedAt:
                  (data.updateDocument?.updatedAt as string) || new Date().toISOString(),
              }
            : prev
        );
        await fetchDocuments();
      }
    },
    [documentId, user?.token, setDocument, fetchDocuments]
  );

  const handleTitleChange = useCallback(
    async (title: string) => {
      if (!user?.token) return;
      const data = await callAppSync<{ updateDocument: Record<string, unknown> | null }>(
        updateDocumentMutation,
        { id: documentId, title },
        user.token
      );
      if (data.updateDocument) {
        setDocument((prev) =>
          prev
            ? {
                ...prev,
                title: (data.updateDocument?.title as string) || title,
                updatedAt:
                  (data.updateDocument?.updatedAt as string) || new Date().toISOString(),
              }
            : prev
        );
        await fetchDocuments();
      }
    },
    [documentId, user?.token, setDocument, fetchDocuments]
  );

  const handleCreateDoc = useCallback(async () => {
    if (!user) return;
    const newDoc = await createDoc('Untitled', 'javascript', user.userId);
    if (newDoc) router.push(`/editor/${newDoc.documentId}`);
  }, [user, createDoc, router]);

  const handleDeleteDoc = useCallback(
    async (docId: string) => {
      await deleteDoc(docId);
      if (docId === documentId) router.push('/dashboard');
    },
    [deleteDoc, documentId, router]
  );

  const handleRunCode = useCallback(async () => {
    if (!doc) return;
    setIsExecuting(true);
    setIsPanelOpen(true);
    setActiveTab('output');
    setExecuteOutput(null); // Clear previous output
    
    const result = await executeCode(doc.language, localContent, executeInput);
    setExecuteOutput(result);
    setIsExecuting(false);
  }, [doc, localContent, executeInput]);

  if (authLoading || isLoading) {
    return (
      <div className="loading-screen">
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="error-screen">
        <h2>Document not found</h2>
        <p>The document you&apos;re looking for doesn&apos;t exist.</p>
        <button className="hero-btn hero-btn-primary" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <Header />
      <div className="editor-layout">
        <Sidebar
          documents={documents}
          activeDocumentId={documentId}
          onSelectDocument={(id) => router.push(`/editor/${id}`)}
          onCreateDocument={handleCreateDoc}
          onDeleteDocument={handleDeleteDoc}
        />
        <div className="editor-main">
          <div className="editor-top-bar">
            <Toolbar
              title={doc.title}
              language={doc.language}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              isExecuting={isExecuting}
              documentId={documentId}
              onLanguageChange={handleLanguageChange}
              onTitleChange={handleTitleChange}
              onSave={handleSave}
              onExecute={handleRunCode}
            />
            <UserPresence users={activeUsers} />
          </div>
          
          <div className="editor-workspace">
            <div className={`editor-container ${isPanelOpen ? 'panel-open' : ''}`}>
              <CodeEditor
                content={localContent}
                language={doc.language}
                onChange={handleChange}
              />
            </div>
            
            {isPanelOpen && (
              <div className="execution-panel">
                <div className="panel-header">
                  <div className="panel-tabs">
                    <button 
                      className={`panel-tab ${activeTab === 'output' ? 'active' : ''}`}
                      onClick={() => setActiveTab('output')}
                    >
                      <Terminal size={14} /> Output
                    </button>
                    <button 
                      className={`panel-tab ${activeTab === 'input' ? 'active' : ''}`}
                      onClick={() => setActiveTab('input')}
                    >
                      Stdin
                    </button>
                  </div>
                  <button className="panel-close-btn" onClick={() => setIsPanelOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                
                <div className="panel-content">
                  {activeTab === 'input' ? (
                    <textarea
                      className="panel-textarea"
                      placeholder="Enter standard input here... (Optional)"
                      value={executeInput}
                      onChange={(e) => setExecuteInput(e.target.value)}
                    />
                  ) : (
                    <div className="panel-output">
                      {isExecuting ? (
                        <div className="panel-loading">
                          <Loader2 size={18} className="spinner" /> Executing code...
                        </div>
                      ) : executeOutput ? (
                        <>
                          {executeOutput.compileOutput && (
                            <div className="output-section">
                              <span className="output-label">Compiler Output:</span>
                              <pre className="output-compile">{executeOutput.compileOutput}</pre>
                            </div>
                          )}
                          {executeOutput.stdout && (
                            <div className="output-section">
                              <pre className="output-stdout">{executeOutput.stdout}</pre>
                            </div>
                          )}
                          {executeOutput.stderr && (
                            <div className="output-section">
                              <span className="output-label error">Error:</span>
                              <pre className="output-stderr">{executeOutput.stderr}</pre>
                            </div>
                          )}
                          {!executeOutput.stdout && !executeOutput.stderr && !executeOutput.compileOutput && (
                            <div className="output-muted">Program finished with no output.</div>
                          )}
                        </>
                      ) : (
                        <div className="output-muted">Click "Run" to execute the code.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

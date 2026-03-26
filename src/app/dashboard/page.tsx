'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useDocument } from '@/hooks/useDocument';
import Header from '@/components/Header';
import { Plus, FileCode, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { documents, fetchDocuments, createDoc, deleteDoc, isLoading, error } = useDocument();
  const router = useRouter();
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocLang, setNewDocLang] = useState('javascript');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [isAuthenticated, fetchDocuments]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshOnFocus = () => {
      fetchDocuments();
    };

    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchDocuments();
      }
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDocuments();
      }
    }, 4000);

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, [isAuthenticated, fetchDocuments]);

  const handleCreate = async () => {
    if (!newDocTitle.trim() || !user) return;
    const doc = await createDoc(newDocTitle, newDocLang, user.userId);
    if (doc) {
      router.push(`/editor/${doc.documentId}`);
    }
    setShowNewDocModal(false);
    setNewDocTitle('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Your Documents</h1>
            <p>Create, edit, and collaborate on code in real-time</p>
          </div>
          <button
            id="create-document-button"
            className="dashboard-create-btn"
            onClick={() => setShowNewDocModal(true)}
          >
            <Plus size={18} />
            <span>New Document</span>
          </button>
        </div>

        {isLoading ? (
          <div className="dashboard-loading">
            <Loader2 size={32} className="spinner" />
            <p>Loading documents...</p>
          </div>
        ) : error ? (
          <div className="dashboard-empty">
            <FileCode size={64} />
            <h2>Unable to load documents</h2>
            <p>{error}</p>
            <button
              className="dashboard-create-btn"
              onClick={() => fetchDocuments()}
            >
              Retry
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="dashboard-empty">
            <FileCode size={64} />
            <h2>No documents yet</h2>
            <p>Create your first document to start coding collaboratively</p>
            <button
              id="create-first-document"
              className="dashboard-create-btn"
              onClick={() => setShowNewDocModal(true)}
            >
              <Plus size={18} />
              <span>Create Document</span>
            </button>
          </div>
        ) : (
          <div className="dashboard-grid">
            {documents.map((doc) => (
              <div key={doc.documentId} className="document-card" id={`doc-card-${doc.documentId}`}>
                <div className="document-card-header">
                  <span className="document-lang-badge">{(doc.language || 'text').toUpperCase()}</span>
                  <button
                    className="document-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDoc(doc.documentId);
                    }}
                    title="Delete document"
                  >
                    ×
                  </button>
                </div>
                <h3 className="document-card-title">{doc.title || 'Untitled'}</h3>
                <p className="document-card-preview">
                  {(doc.content || '').slice(0, 100) || 'Empty document'}
                </p>
                <div className="document-card-footer">
                  <span className="document-card-time">
                    <Clock size={14} />
                    {formatDate(doc.updatedAt)}
                  </span>
                  <button
                    id={`open-doc-${doc.documentId}`}
                    className="document-card-open"
                    onClick={() => router.push(`/editor/${doc.documentId}`)}
                  >
                    Open <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewDocModal && (
        <div className="modal-overlay" onClick={() => setShowNewDocModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Document</h2>
            <div className="form-group">
              <label htmlFor="new-doc-title">File Name</label>
              <input
                id="new-doc-title"
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="e.g. main.js"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-doc-lang">Language</label>
              <select
                id="new-doc-lang"
                value={newDocLang}
                onChange={(e) => setNewDocLang(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                id="cancel-create-btn"
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowNewDocModal(false)}
              >
                Cancel
              </button>
              <button
                id="confirm-create-btn"
                className="modal-btn modal-btn-primary"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

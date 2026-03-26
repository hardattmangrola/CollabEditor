'use client';

import { Document } from '@/types';
import { Plus, FileCode, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  documents: Document[];
  activeDocumentId?: string;
  onSelectDocument: (documentId: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (documentId: string) => void;
}

const LANG_ICONS: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  java: 'JV',
  css: 'CS',
  html: 'HT',
  json: 'JN',
  go: 'GO',
  rust: 'RS',
};

export default function Sidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h3>Files</h3>}
        <button
          id="sidebar-toggle"
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <button id="create-document-sidebar" className="sidebar-create-btn" onClick={onCreateDocument}>
            <Plus size={16} />
            <span>New File</span>
          </button>

          <div className="sidebar-file-list">
            {documents.map((doc) => (
              <div
                key={doc.documentId}
                className={`sidebar-file-item ${
                  activeDocumentId === doc.documentId ? 'active' : ''
                }`}
              >
                <button
                  id={`file-${doc.documentId}`}
                  className="sidebar-file-btn"
                  onClick={() => onSelectDocument(doc.documentId)}
                >
                  <span className="file-lang-badge">
                    {LANG_ICONS[doc.language] || <FileCode size={14} />}
                  </span>
                  <span className="file-name">{doc.title}</span>
                </button>
                <button
                  id={`delete-${doc.documentId}`}
                  className="sidebar-file-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.documentId);
                  }}
                  title="Delete file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

'use client';

import { useState } from 'react';
import { Copy, Check, Save, ChevronDown, Play, Loader2 } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'json', label: 'JSON' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'sql', label: 'SQL' },
  { id: 'yaml', label: 'YAML' },
  { id: 'xml', label: 'XML' },
];

interface ToolbarProps {
  title: string;
  language: string;
  isSaving: boolean;
  hasUnsavedChanges?: boolean;
  isExecuting?: boolean;
  documentId: string;
  onLanguageChange: (language: string) => void;
  onTitleChange: (title: string) => void;
  onSave?: () => void;
  onExecute?: () => void;
}

export default function Toolbar({
  title,
  language,
  isSaving,
  hasUnsavedChanges = false,
  isExecuting = false,
  documentId,
  onLanguageChange,
  onTitleChange,
  onSave,
  onExecute,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/editor/${documentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {isEditingTitle ? (
          <input
            id="document-title-input"
            className="toolbar-title-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            autoFocus
          />
        ) : (
          <button
            id="document-title-button"
            className="toolbar-title"
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename"
          >
            {title}
          </button>
        )}

        <div className="toolbar-save-indicator">
          <Save size={14} />
          <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}</span>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="language-selector">
          <button
            id="language-selector-button"
            className="language-selector-btn"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <span>{LANGUAGES.find((l) => l.id === language)?.label || language}</span>
            <ChevronDown size={14} />
          </button>
          {isLangOpen && (
            <div className="language-dropdown">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  id={`lang-option-${lang.id}`}
                  className={`language-option ${language === lang.id ? 'active' : ''}`}
                  onClick={() => {
                    onLanguageChange(lang.id);
                    setIsLangOpen(false);
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {onExecute && (
          <button
            id="run-code-button"
            className="toolbar-btn run-btn"
            onClick={onExecute}
            disabled={isExecuting}
            title="Run Code"
          >
            {isExecuting ? <Loader2 size={16} className="spinner" /> : <Play size={16} fill="currentColor" />}
            <span>Run</span>
          </button>
        )}

        {onSave && (
          <button
            id="save-document-button"
            className="toolbar-btn"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            title="Save Document"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        )}

        <button id="share-button" className="toolbar-btn share-btn" onClick={handleCopyLink}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
}

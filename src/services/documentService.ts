import { Document } from '@/types';

// In-memory document store (simulates DynamoDB Documents table)
const documents: Map<string, Document> = new Map();

// Seed with sample documents
const sampleDocs: Document[] = [
  {
    documentId: 'doc-001',
    title: 'Welcome.js',
    content: `// Welcome to Collab Editor!\n// Start coding together in real-time.\n\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to the collaborative editor.\`;\n}\n\nconsole.log(greet('World'));\n`,
    language: 'javascript',
    ownerId: 'user-001',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    documentId: 'doc-002',
    title: 'styles.css',
    content: `/* Global Styles */\n:root {\n  --primary: #6366f1;\n  --background: #0f172a;\n  --text: #e2e8f0;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background: var(--background);\n  color: var(--text);\n}\n`,
    language: 'css',
    ownerId: 'user-001',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    documentId: 'doc-003',
    title: 'server.py',
    content: `from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route('/api/health')\ndef health_check():\n    return jsonify({"status": "ok", "service": "collab-editor"})\n\nif __name__ == '__main__':\n    app.run(debug=True, port=5000)\n`,
    language: 'python',
    ownerId: 'user-001',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

sampleDocs.forEach((doc) => documents.set(doc.documentId, doc));

export function getDocument(documentId: string): Document | undefined {
  return documents.get(documentId);
}

export function listDocuments(): Document[] {
  return Array.from(documents.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function createDocument(doc: Omit<Document, 'createdAt' | 'updatedAt'>): Document {
  const now = new Date().toISOString();
  const newDoc: Document = {
    ...doc,
    createdAt: now,
    updatedAt: now,
  };
  documents.set(newDoc.documentId, newDoc);
  return newDoc;
}

export function updateDocument(
  documentId: string,
  updates: Partial<Pick<Document, 'content' | 'title' | 'language'>>
): Document | undefined {
  const doc = documents.get(documentId);
  if (!doc) return undefined;

  const updated: Document = {
    ...doc,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  documents.set(documentId, updated);
  return updated;
}

export function deleteDocument(documentId: string): boolean {
  return documents.delete(documentId);
}

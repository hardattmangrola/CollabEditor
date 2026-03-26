export interface User {
  userId: string;
  email: string;
  displayName: string;
  avatarColor: string;
  token?: string;
}

export interface Document {
  documentId: string;
  title: string;
  content: string;
  language: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  sessionId: string;
  documentId: string;
  activeUsers: User[];
}

export interface CollaborationEvent {
  type: 'update' | 'cursor' | 'join' | 'leave';
  documentId: string;
  content?: string;
  userId: string;
  timestamp: string;
  cursorPosition?: { lineNumber: number; column: number };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

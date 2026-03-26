'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { Code2, LogOut, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <Link href="/" className="header-logo" id="header-logo">
        <Code2 size={28} />
        <span className="header-logo-text">
          Collab<span className="header-logo-accent">Editor</span>
        </span>
      </Link>

      <nav className="header-nav">
        {isAuthenticated && (
          <>
            <Link href="/dashboard" className="header-nav-link" id="nav-dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <div className="header-user">
              <div
                className="header-user-avatar"
                style={{ backgroundColor: user?.avatarColor }}
              >
                {user?.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="header-user-name">{user?.displayName || user?.email}</span>
              <button id="logout-button" className="header-logout-btn" onClick={logout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

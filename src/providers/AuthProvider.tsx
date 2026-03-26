'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { AuthProvider as OidcAuthProvider, useAuth as useOidcAuth } from 'react-oidc-context';
import { cognitoOidcConfig, awsConfig } from '@/config/aws';
import { User, AuthState } from '@/types';

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#8b5cf6', '#ef4444', '#10b981', '#3b82f6',
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ------- Internal context that maps OIDC state to app types -------

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  // signup not needed — Cognito Hosted UI handles it
  signup: (email: string, password: string, displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthBridge({ children }: { children: React.ReactNode }) {
  const oidc = useOidcAuth();

  const user: User | null = useMemo(() => {
    if (!oidc.isAuthenticated || !oidc.user) return null;
    const profile = oidc.user.profile;
    const sub = profile.sub || oidc.user.profile.sub || oidc.user.id_token?.slice(0, 16) || `user-${Date.now()}`;
    const appsyncToken = oidc.user.id_token || oidc.user.access_token;
    return {
      userId: sub,
      email: (profile.email as string) || 'unknown@user.com',
      displayName: (profile.email as string)?.split('@')[0] || (profile.name as string) || 'User',
      avatarColor: getAvatarColor(sub),
      token: appsyncToken,
    };
  }, [oidc.isAuthenticated, oidc.user]);

  const login = () => {
    oidc.signinRedirect();
  };

  const logout = () => {
    const cognitoDomain = awsConfig.cognito.domain;
    const clientId = awsConfig.cognito.clientId;
    const logoutUri = cognitoOidcConfig.redirect_uri;

    // Remove local OIDC session
    oidc.removeUser();

    // Redirect to Cognito logout endpoint to clear server-side session
    if (cognitoDomain && cognitoDomain !== '' && !cognitoDomain.includes('YOUR_DOMAIN_PREFIX')) {
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    }
  };

  const signup = async () => {
    // With Cognito Hosted UI, sign-up is handled on the same redirect page
    oidc.signinRedirect();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: oidc.isAuthenticated,
    isLoading: oidc.isLoading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ------- Exported Provider & Hook -------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const onSigninCallback = () => {
    // Remove the OIDC code/state params from the URL after login
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <OidcAuthProvider {...cognitoOidcConfig} onSigninCallback={onSigninCallback}>
      <AuthBridge>{children}</AuthBridge>
    </OidcAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

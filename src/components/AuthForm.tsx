'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Shield, Loader2, LogIn } from 'lucide-react';

export default function AuthForm() {
  const { login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-form-container">
        <div className="auth-form-card">
          <div className="auth-form-header" style={{ textAlign: 'center' }}>
            <Loader2 size={32} className="spinner" />
            <p>Connecting to authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <Shield size={32} style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }} />
          <h2>Welcome to CollabEditor</h2>
          <p>Sign in securely with your AWS Cognito account</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            id="auth-submit-button"
            className="auth-submit-btn"
            onClick={() => login()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogIn size={18} />
            Sign in with Cognito
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
          You will be redirected to the AWS Cognito login page.
          <br />
          New users can create an account there.
        </p>
      </div>
    </div>
  );
}

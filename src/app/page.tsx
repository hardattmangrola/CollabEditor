'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Code2, Users, Zap, Shield } from 'lucide-react';
import Header from '@/components/Header';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Header />

      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Real-time Collaboration</span>
          </div>
          <h1 className="hero-title">
            Code Together,
            <br />
            <span className="hero-title-accent">Build Faster</span>
          </h1>
          <p className="hero-description">
            A production-grade collaborative code editor where multiple users can edit
            the same document simultaneously with low latency and secure access.
          </p>
          <div className="hero-actions">
            <button
              id="get-started-button"
              className="hero-btn hero-btn-primary"
              onClick={() => router.push('/auth')}
            >
              Get Started
            </button>
            <button
              id="learn-more-button"
              className="hero-btn hero-btn-secondary"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-editor-preview">
            <div className="preview-header">
              <div className="preview-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="preview-filename">main.ts</span>
            </div>
            <div className="preview-code">
              <code>
                <span className="code-keyword">const</span>{' '}
                <span className="code-variable">editor</span>{' '}
                <span className="code-operator">=</span>{' '}
                <span className="code-keyword">await</span>{' '}
                <span className="code-function">createSession</span>
                <span className="code-bracket">()</span>
                <span className="code-punctuation">;</span>
                <br />
                <span className="code-keyword">const</span>{' '}
                <span className="code-variable">users</span>{' '}
                <span className="code-operator">=</span>{' '}
                <span className="code-keyword">await</span>{' '}
                <span className="code-variable">editor</span>
                <span className="code-punctuation">.</span>
                <span className="code-function">getActiveUsers</span>
                <span className="code-bracket">()</span>
                <span className="code-punctuation">;</span>
                <br />
                <br />
                <span className="code-variable">editor</span>
                <span className="code-punctuation">.</span>
                <span className="code-function">on</span>
                <span className="code-bracket">(</span>
                <span className="code-string">&apos;change&apos;</span>
                <span className="code-punctuation">,</span>{' '}
                <span className="code-bracket">(</span>
                <span className="code-variable">delta</span>
                <span className="code-bracket">)</span>{' '}
                <span className="code-operator">=&gt;</span>{' '}
                <span className="code-bracket">{'{'}</span>
                <br />
                {'  '}
                <span className="code-function">broadcast</span>
                <span className="code-bracket">(</span>
                <span className="code-variable">delta</span>
                <span className="code-bracket">)</span>
                <span className="code-punctuation">;</span>
                <br />
                <span className="code-bracket">{'}'}</span>
                <span className="code-bracket">)</span>
                <span className="code-punctuation">;</span>
              </code>
            </div>
            <div className="preview-cursors">
              <div className="cursor-indicator cursor-1" />
              <div className="cursor-indicator cursor-2" />
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="landing-features">
        <h2 className="features-title">Why CollabEditor?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3>Real-Time Sync</h3>
            <p>Changes propagate in under 200ms. Built on WebSocket subscriptions for instant collaboration.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Users size={24} />
            </div>
            <h3>Multi-User</h3>
            <p>See who&apos;s editing in real-time with presence indicators and cursor tracking.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Code2 size={24} />
            </div>
            <h3>Monaco Editor</h3>
            <p>Full VS Code editing experience with syntax highlighting for 15+ languages.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={24} />
            </div>
            <h3>Secure Access</h3>
            <p>JWT-based authentication with Amazon Cognito. All data encrypted in transit.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

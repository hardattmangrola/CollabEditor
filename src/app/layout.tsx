import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import AmplifyProvider from '@/providers/AmplifyProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollabEditor — Real-Time Collaborative Code Editor',
  description:
    'A production-grade real-time collaborative code editor. Edit code simultaneously with your team, with instant sync, multi-language support, and secure access.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AmplifyProvider>
          <AuthProvider>{children}</AuthProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}

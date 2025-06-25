'use client';

import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function SentryErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={() => <>{fallback}</>}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function captureException(error: unknown, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });
}

export function setUserContext(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}
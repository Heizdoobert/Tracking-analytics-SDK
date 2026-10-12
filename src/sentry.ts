import * as Sentry from '@sentry/nextjs';

export function captureException(error: unknown): void {
  Sentry.captureException(error);
}

export function initSentry(): void {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    debug: false,
  });
}

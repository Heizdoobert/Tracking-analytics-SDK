import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { captureException, initSentry } from '../src/sentry';

vi.mock('@sentry/nextjs', () => ({ init: vi.fn(), captureException: vi.fn() }));

describe('sdk/tracking-analytics sentry', () => {
  beforeEach(() => vi.clearAllMocks());

  it('captureException forwards the error to Sentry', () => {
    const err = new Error('boom');
    captureException(err);
    expect(Sentry.captureException).toHaveBeenCalledWith(err);
  });

  it('initSentry calls Sentry.init with the dsn from the environment', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://key@example.ingest.sentry.io/1';
    initSentry();
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: 'https://key@example.ingest.sentry.io/1',
      tracesSampleRate: 1.0,
      debug: false,
    });
  });
});

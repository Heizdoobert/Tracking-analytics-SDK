'use client';

import { useEffect, type ReactNode } from 'react';

// posthog-js is ~100 kB gzip. Load it after hydration so it stays out of every page's first-load scripts.
let started = false;

export const posthog = undefined;

export function PHProvider({ children }: { client?: unknown; children: ReactNode }): ReactNode {
  useEffect(() => {
    if (started) return;
    started = true;
    import('posthog-js').then(({ default: client }) => {
      client.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // App Router needs custom pageviews if we want them
      });
    });
  }, []);
  return children;
}

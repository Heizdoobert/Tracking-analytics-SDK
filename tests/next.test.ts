import { describe, expect, it, vi } from 'vitest';
import { withTrackingAnalytics } from '../next.mjs';

// Identity stand-in so the test sees the config withTrackingAnalytics builds, not Sentry's webpack plugin wiring.
vi.mock('@sentry/nextjs/config', () => ({ withSentryConfig: (config: unknown) => config }));

type Alias = Record<string, string>;
type Built = {
  turbopack: { resolveAlias: Alias };
  webpack: (config: { resolve: { alias: Alias } }, options: object) => { resolve: { alias: Alias } };
};
const build = (config: object) => withTrackingAnalytics(config) as unknown as Built;

describe('withTrackingAnalytics', () => {
  it('aliases both seams to the package under Turbopack and keeps existing aliases', () => {
    const out = build({ turbopack: { resolveAlias: { other: './other.ts' } } });
    expect(out.turbopack.resolveAlias).toEqual({
      other: './other.ts',
      '@/lib/sdk/sentry': './sdk/tracking-analytics/src/sentry.ts',
      '@/lib/sdk/posthog': './sdk/tracking-analytics/src/posthog.ts',
    });
  });

  it('aliases both seams to the package under webpack and calls an existing webpack hook', () => {
    const existing = vi.fn((config) => config);
    const result = build({ webpack: existing }).webpack({ resolve: { alias: {} } }, {});
    expect(result.resolve.alias['@/lib/sdk/sentry$']).toMatch(/sdk\/tracking-analytics\/src\/sentry\.ts$/);
    expect(result.resolve.alias['@/lib/sdk/posthog$']).toMatch(/sdk\/tracking-analytics\/src\/posthog\.ts$/);
    expect(existing).toHaveBeenCalled();
  });
});

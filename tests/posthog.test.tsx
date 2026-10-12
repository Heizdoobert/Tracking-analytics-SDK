import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const { init } = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock('posthog-js', () => ({ default: { init } }));
vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="ph">{children}</div>,
}));

describe('sdk/tracking-analytics posthog', () => {
  it('initialises posthog once on import and renders its children', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test';
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
    const { PHProvider, posthog } = await import('../src/posthog');

    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith('phc_test', {
      api_host: 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
    });

    render(
      <PHProvider client={posthog}>
        <p>child</p>
      </PHProvider>
    );
    expect(screen.getByTestId('ph').textContent).toBe('child');
  });
});

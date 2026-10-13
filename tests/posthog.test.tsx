import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const { init } = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock('posthog-js', () => ({ default: { init } }));

describe('sdk/tracking-analytics posthog', () => {
  it('renders children, then initialises posthog once with today\'s settings', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test';
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
    const { PHProvider } = await import('../src/posthog');

    const tree = (
      <PHProvider>
        <p>child</p>
      </PHProvider>
    );
    const { rerender } = render(tree);
    expect(screen.getByText('child')).toBeTruthy();

    await waitFor(() => expect(init).toHaveBeenCalledTimes(1));
    expect(init).toHaveBeenCalledWith('phc_test', {
      api_host: 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
    });

    rerender(tree);
    render(tree);
    expect(init).toHaveBeenCalledTimes(1);
  });
});

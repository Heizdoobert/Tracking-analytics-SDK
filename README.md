# sdk/tracking-analytics

Optional error tracking (Sentry) and analytics (PostHog). The app imports from `@/lib/sdk/sentry` and
`@/lib/sdk/posthog`, which are no-ops. When this folder exists, `next.config.mjs` loads `next.mjs`, which
aliases those two modules to `src/sentry.ts` and `src/posthog.ts` and applies Sentry's build config.
Nothing checks for the folder at runtime.

| File | Role |
|---|---|
| `src/sentry.ts` | Real `captureException` and `initSentry` (the only `@sentry/nextjs` import in the app) |
| `src/posthog.ts` | Real `PHProvider`: renders its children, then loads `posthog-js` after hydration and runs `posthog.init` once (the only `posthog-js` import in the app). Lazy so the ~100 kB gzip library stays out of first-load scripts |
| `next.mjs` | `withTrackingAnalytics(nextConfig)`: both aliases plus `withSentryConfig` |

`sdk/` is the home for optional SDK modules; add the next one as `sdk/<name>/` in the same shape.
`lib/sdk/` is the app-side seam that imports from it.

Remove it: delete this folder. `@sentry/nextjs` and `posthog-js` stay in the root `dependencies` and are not bundled.

Check it is gone: `rm -rf .next && npm run build`, then
`grep -rl "@sentry\|tracesSampleRate" .next/static .next/server --include=*.js --include=*.json` and
`grep -rl person_profiles .next/static .next/server` both print nothing.

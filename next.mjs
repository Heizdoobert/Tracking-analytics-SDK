import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs/config';

// Seam module in the app -> file in this package that replaces it.
const SEAMS = { '@/lib/sdk/sentry': 'sentry', '@/lib/sdk/posthog': 'posthog' };
const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src');

// Swaps the app's no-op seams for this package and applies Sentry's build config.
export function withTrackingAnalytics(nextConfig) {
  const resolveAlias = { ...nextConfig.turbopack?.resolveAlias };
  for (const [seam, file] of Object.entries(SEAMS)) {
    resolveAlias[seam] = `./sdk/tracking-analytics/src/${file}.ts`;
  }

  const config = {
    ...nextConfig,
    turbopack: { ...nextConfig.turbopack, resolveAlias },
    webpack(webpackConfig, options) {
      for (const [seam, file] of Object.entries(SEAMS)) {
        webpackConfig.resolve.alias[`${seam}$`] = path.join(srcDir, `${file}.ts`);
      }
      return nextConfig.webpack ? nextConfig.webpack(webpackConfig, options) : webpackConfig;
    },
  };

  return withSentryConfig(config, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  }, {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  });
}

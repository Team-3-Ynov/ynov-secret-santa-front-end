import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withSentryConfig(nextConfig, {
  // Suppress CLI output unless running in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route Sentry event ingestion through /monitoring to avoid ad-blockers
  tunnelRoute: "/monitoring",

  // Hides the Sentry logger in production to reduce bundle size
  disableLogger: true,
});

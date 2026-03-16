import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook — invoked once per runtime start.
 * Loads the Sentry config for the active runtime (Node.js server or Edge).
 * The client config is auto-injected by withSentryConfig in next.config.ts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Captures unhandled server-side request errors (Next.js 15+).
 * Works for Route Handlers, Server Actions, and Page rendering errors.
 */
export const onRequestError = Sentry.captureRequestError;

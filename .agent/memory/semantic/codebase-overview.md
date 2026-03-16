<!-- codebase-overview.md - Retrieval-Aware Format -->
<!-- Updated: 2026-03-16 -->

## INDEX
- [App Router Structure](#app-router-structure) - pages, route groups, error boundary
- [Shared Components](#shared-components) - navbar, dialogs, helpers
- [Observability](#observability) - sentry, client config, instrumentation
- [Utilities And Tests](#utilities-and-tests) - validation, oxlint, typecheck, vitest

## Activation Matrix

- Context: App Router Structure
- Roles: `frontend-engineer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`, `02-ui-tailwind.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/orchestrator.md`

- Context: Shared Components
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `02-ui-tailwind.md`, `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/rules/tier-0/11-agent-behavior.md`

- Context: Observability
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `03-security.md`, `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/auto-learning.md`

- Context: Utilities And Tests
- Roles: `frontend-engineer.md`
- Tier 1 Skills: `06-testing.md`, `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/auto-learning.md`

## <section id="app-router-structure"> App Router Structure

- `src/app/page.tsx` is the landing page.
- `src/app/auth/*` contains login and signup pages.
- `src/app/events/*` contains list/detail/join/invite pages.
- `src/app/invitations`, `src/app/profile`, `src/app/secretsanta/*` support core user flows.
- `src/app/global-error.tsx` is the App Router root error boundary ("use client", wraps its own `<html>/<body>`). It captures uncaught errors with `Sentry.captureException` and renders a fallback UI with a reset button.

</section>

## <section id="shared-components"> Shared Components

- `Navbar.tsx` provides top-level navigation.
- `InviteDialog.tsx` handles invitation interactions.
- `PasswordRequirements.tsx` supports password UX guidance.

</section>

## <section id="utilities-and-tests"> Utilities And Tests

- `src/utils/validation.ts` centralizes client-side validation helpers.
- `src/utils/__tests__/validation.test.ts` validates utility behavior.
- `pnpm typecheck` → `oxlint src` (OXC, ~36ms, plugins: react, nextjs, jsx-a11y, import) then `tsc --noEmit`. Config: `.oxlintrc.json`.

</section>

## <section id="observability"> Observability

- SDK: `@sentry/nextjs` v10. Next.js 16 App Router integration.
- `sentry.client.config.ts` — browser init. Enables `browserTracingIntegration` and `replayIntegration` (session replay on errors). Uses `NEXT_PUBLIC_SENTRY_DSN`.
- `sentry.server.config.ts` — Node.js runtime init. Uses `SENTRY_DSN` (private).
- `sentry.edge.config.ts` — Edge runtime init. Uses `SENTRY_DSN` (private).
- `src/instrumentation.ts` — Next.js `register()` hook; loads server or edge config depending on `NEXT_RUNTIME`. Exports `onRequestError = Sentry.captureRequestError` to auto-capture Route Handler / Server Action / page errors.
- `next.config.ts` — wrapped with `withSentryConfig` (tunnels events through `/monitoring` to avoid ad-blockers, uploads source maps, silences CLI noise outside CI).
- **Env vars:** `NEXT_PUBLIC_SENTRY_DSN` (browser), `SENTRY_DSN` (server/edge). See `known-pitfalls.md`.

</section>

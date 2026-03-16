<!-- known-pitfalls.md - Retrieval-Aware Format -->
<!-- Updated: 2026-03-16 -->

## INDEX
- [Sentry DSN Variable Names](#sentry-dsn-variable-names) - NEXT_PUBLIC_SENTRY_DSN vs SENTRY_DSN
- [Instrumentation File Location](#instrumentation-file-location) - src/ not app/
- [Global Error Boundary Shape](#global-error-boundary-shape) - use client, html/body
- [Oxlint Scope](#oxlint-scope) - typecheck, oxlint vs tsc, plugin conflicts

## Activation Matrix

- Context: Sentry DSN Variable Names
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `03-security.md`, `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/orchestrator.md`

- Context: Instrumentation File Location
- Roles: `frontend-engineer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/rules/tier-0/11-agent-behavior.md`

- Context: Global Error Boundary Shape
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`, `02-ui-tailwind.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/auto-learning.md`

- Context: Oxlint Scope
- Roles: `frontend-engineer.md`
- Tier 1 Skills: `06-testing.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/auto-learning.md`

## <section id="sentry-dsn-variable-names"> Sentry DSN Variable Names

**Pitfall:** Using `SENTRY_DSN` (private) for the browser client config, or using `NEXT_PUBLIC_SENTRY_DSN` (public) for server/edge configs.

**Root cause:** Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` to the browser bundle. A private `SENTRY_DSN` in `sentry.client.config.ts` will be `undefined` at runtime — Sentry will silently disable itself. Conversely, using `NEXT_PUBLIC_SENTRY_DSN` on the server is fine but unnecessarily exposes the DSN in client bundles where it would also be read.

**Fix:**
- `sentry.client.config.ts` → `process.env.NEXT_PUBLIC_SENTRY_DSN`
- `sentry.server.config.ts` → `process.env.SENTRY_DSN`
- `sentry.edge.config.ts` → `process.env.SENTRY_DSN`

</section>

## <section id="instrumentation-file-location"> Instrumentation File Location

**Pitfall:** Placing `instrumentation.ts` inside `src/app/` instead of `src/`.

**Root cause:** Next.js resolves the `instrumentation` file from the project root or the `src/` directory directly. It must be `src/instrumentation.ts` (or `instrumentation.ts` at the root). If placed inside `src/app/`, Next.js will not pick it up as the instrumentation hook and `register()` / `onRequestError` will never be called.

**Fix:** Keep the file at `src/instrumentation.ts`. Do not move it.

</section>

## <section id="global-error-boundary-shape"> Global Error Boundary Shape

**Pitfall:** Forgetting `"use client"` or omitting `<html>/<body>` in `global-error.tsx`.

**Root cause:** `global-error.tsx` replaces the entire root layout (including `layout.tsx`) when a fatal error occurs. It therefore must render a complete HTML document. Without `"use client"` it cannot use `useEffect` (needed for `captureException`). Without `<html lang>/<body>` the browser receives a partial document.

**Fix:**
```tsx
"use client";
// Must return full document
return (
  <html lang="fr">
    <body>...</body>
  </html>
);
```

Also: props must be typed as `Readonly<{ error: Error & { digest?: string }; reset: () => void }>` to satisfy Biome's `useReadonlyProps` rule.

</section>

## <section id="oxlint-scope"> Oxlint Scope

**Pitfall:** Expecting `oxlint` to fully replace `tsc --noEmit` for type-safety.

**Root cause:** `oxlint` is a fast Rust-based linter (OXC project). It catches many code-quality and TypeScript-style issues in ~36ms, but does NOT perform full type inference. Only `tsc --noEmit` can catch inference errors (wrong return type, unknown property access, generic constraint violations, etc.).

**Fix:** `pnpm typecheck` runs both in sequence: `oxlint src` first as a fast fail gate, then `tsc --noEmit` for inference. Never skip either step.

**Pitfall (plugin conflicts):** The frontend `.oxlintrc.json` enables the `react` and `nextjs` plugins. Do not also enable the `jest` plugin — the project uses Vitest. Jest and Vitest plugins have overlapping rule names; enabling both causes false positives.

</section>

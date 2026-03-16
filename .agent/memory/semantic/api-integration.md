<!-- api-integration.md - Retrieval-Aware Format -->
<!-- Updated: 2026-03-16 -->

## INDEX
- [API Base URL](#api-base-url) - NEXT_PUBLIC_API_URL
- [Auth Header Pattern](#auth-header-pattern) - bearer token
- [Error Handling Pattern](#error-handling-pattern) - 401 and fallback parsing

## Activation Matrix

- Context: API Base URL
- Roles: `frontend-engineer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`, `03-security.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/orchestrator.md`

- Context: Auth Header Pattern
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `03-security.md`, `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/rules/tier-0/11-agent-behavior.md`

- Context: Error Handling Pattern
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`, `02-ui-tailwind.md`, `03-security.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/auto-learning.md`

## <section id="api-base-url"> API Base URL

- Frontend uses `NEXT_PUBLIC_API_URL` when set.
- Fallback base URL currently points to `http://localhost:3001`.

</section>

## <section id="auth-header-pattern"> Auth Header Pattern

- Protected calls attach `Authorization: Bearer <token>` from local storage.
- Missing token should short-circuit to user-facing auth message or redirect.

</section>

## <section id="error-handling-pattern"> Error Handling Pattern

- Handle `res.ok === false` explicitly.
- Special-case 401 to indicate session expiration.
- Parse error JSON defensively with fallback message.

</section>

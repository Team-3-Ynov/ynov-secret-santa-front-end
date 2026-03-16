<!-- api-integration.md - Retrieval-Aware Format -->
<!-- Updated: 2026-03-16 -->

## INDEX
- [API Base URL](#api-base-url) - NEXT_PUBLIC_API_URL
- [Auth Header Pattern](#auth-header-pattern) - bearer token
- [Error Handling Pattern](#error-handling-pattern) - 401 and fallback parsing

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

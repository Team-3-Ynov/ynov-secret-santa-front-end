# Skill 03 - Security

> Prevent frontend-side security regressions in auth and API consumption.

## Token Handling

- Treat local storage token as optional and untrusted.
- Handle missing or expired token with explicit UI fallback and redirect strategy.
- Never log tokens or sensitive payloads to console in production code.

## API Consumption

- Include `Authorization` header only when token is present.
- Handle 401 and 403 responses explicitly.
- Do not assume response shape without defensive parsing.

## Sensitive Data Rules

- Never expose secrets in client bundles.
- Keep only `NEXT_PUBLIC_*` values in public runtime configuration.
- Avoid rendering backend error internals directly to end users.

<!-- Source: frontend auth fetch patterns -->
<!-- Updated: 2026-03-16 -->

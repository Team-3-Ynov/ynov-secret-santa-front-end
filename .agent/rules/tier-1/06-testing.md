# Skill 06 - Testing

> Maintain confidence in key frontend behavior with targeted tests.

## Coverage Priorities

- Validation utilities under `src/utils/validation.ts`.
- Authentication form edge cases and error states.
- Event list/detail rendering logic for empty and populated states.

## Test Strategy

- Use unit tests for pure logic and deterministic helpers.
- Add integration-style component tests for critical user flows when complexity grows.
- Keep tests readable and aligned with user-visible behavior.

## Quality Gates

- Run `pnpm test` (or `npm test`) before completion claims.
- Add regression tests for every confirmed bug in validation or route behavior.

<!-- Source: jest + current utility tests -->
<!-- Updated: 2026-03-16 -->

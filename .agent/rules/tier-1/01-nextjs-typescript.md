# Skill 01 - Nextjs TypeScript

> Implement reliable Next.js App Router code with strict TypeScript practices.

## Component And Route Conventions

- Keep route-level UI in `src/app/**/page.tsx`.
- Keep reusable UI in `src/components`.
- Keep pure utility logic in `src/utils` and unit test it.

## Type Safety

- Prefer explicit interfaces for API payloads consumed by pages/components.
- Avoid `any`; use narrow unions and optional fields for uncertain API values.
- Handle nullable browser-only APIs safely in client components.

## Data Fetching

- Resolve API base URL through `NEXT_PUBLIC_API_URL` fallback strategy.
- Guard auth-required fetches when token is missing or expired.
- Surface user-friendly error messages and preserve actionable debug context.

<!-- Source: Next.js app router + project conventions -->
<!-- Updated: 2026-03-16 -->

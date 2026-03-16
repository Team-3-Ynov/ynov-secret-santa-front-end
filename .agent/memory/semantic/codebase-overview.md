<!-- codebase-overview.md - Retrieval-Aware Format -->
<!-- Updated: 2026-03-16 -->

## INDEX
- [App Router Structure](#app-router-structure) - pages, route groups
- [Shared Components](#shared-components) - navbar, dialogs, helpers
- [Utilities And Tests](#utilities-and-tests) - validation, jest

## <section id="app-router-structure"> App Router Structure

- `src/app/page.tsx` is the landing page.
- `src/app/auth/*` contains login and signup pages.
- `src/app/events/*` contains list/detail/join/invite pages.
- `src/app/invitations`, `src/app/profile`, `src/app/secretsanta/*` support core user flows.

</section>

## <section id="shared-components"> Shared Components

- `Navbar.tsx` provides top-level navigation.
- `InviteDialog.tsx` handles invitation interactions.
- `PasswordRequirements.tsx` supports password UX guidance.

</section>

## <section id="utilities-and-tests"> Utilities And Tests

- `src/utils/validation.ts` centralizes client-side validation helpers.
- `src/utils/__tests__/validation.test.ts` validates utility behavior.

</section>

<!-- routes-and-pages.md - Retrieval-Aware Format -->
<!-- Updated: 2026-03-16 -->

## INDEX
- [Auth Routes](#auth-routes) - login, signup
- [Event Routes](#event-routes) - list, details, invite, join, edit
- [Account Routes](#account-routes) - invitations, profile

## Activation Matrix

- Context: Auth Routes
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`, `03-security.md`, `02-ui-tailwind.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/orchestrator.md`

- Context: Event Routes
- Roles: `frontend-engineer.md`
- Tier 1 Skills: `01-nextjs-typescript.md`, `02-ui-tailwind.md`, `03-security.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/system/auto-learning.md`

- Context: Account Routes
- Roles: `frontend-engineer.md`, `frontend-accessibility-reviewer.md`
- Tier 1 Skills: `02-ui-tailwind.md`, `01-nextjs-typescript.md`
- Core Rules: `.agent/system/alignment.md`, `.agent/rules/tier-0/11-agent-behavior.md`

## <section id="auth-routes"> Auth Routes

- `/auth/login`: sign-in UI and token initialization flow.
- `/auth/signup`: account creation with password requirement guidance.

</section>

## <section id="event-routes"> Event Routes

- `/events`: list current user events.
- `/events/[id]`: event detail page.
- `/events/[id]/invite` and `/events/[id]/join`: participation flows.
- `/secretsanta/create` and `/secretsanta/edit/[id]`: create/edit event workflows.

</section>

## <section id="account-routes"> Account Routes

- `/invitations`: invitation list/management.
- `/profile`: user profile page and account-specific interactions.

</section>

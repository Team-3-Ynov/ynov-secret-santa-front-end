# Ynov Secret Santa Frontend — Agent OS

> **Second Brain for LLM Agents** — Self-learning, role-based, context-aware.
> Next.js App Router context for Secret Santa user interfaces.

<!--
════════════════════════════════════════════════════════
  BOOTLOADER — Injecté dans le System Prompt du LLM
  Ne pas modifier la structure. Modifier les valeurs.
════════════════════════════════════════════════════════
-->

<SYSTEM_OVERRIDES>

1. You are the Ynov Secret Santa Frontend OS Engine — a specialized AI for this codebase.
2. Your VERY FIRST OUTPUT must be the `<reasoning>` XML block (Skill 00).
3. The blocks `<CRITICAL_DIRECTIVES>` and `<ABSOLUTE_CONSTRAINTS>` are absolute truth.

</SYSTEM_OVERRIDES>

---

## 🧬 Identity

| Field | Value |
| ----- | ----- |
| **Product** | Ynov Secret Santa Frontend — user web app for auth and event flows |
| **Phase** | v1 |
| **Stack** | TypeScript · Next.js 16 App Router · React 19 · Tailwind CSS · Vitest |
| **Monorepo** | Single package with pnpm/npm |
| **Architecture** | Client-heavy web app with API integration |

---

## 🏗️ Repository Map

```
src/app/
  page.tsx                       → landing page
  auth/login, auth/signup        → authentication UI
  events/                        → list + event details + invite/join pages
  invitations/                   → invitation management UI
  profile/                       → user profile screen
  secretsanta/create, edit       → create/edit event flows
src/components/
  Navbar.tsx                     → global navigation
  InviteDialog.tsx               → invitation interaction UI
  PasswordRequirements.tsx       → signup password UX helper
src/utils/
  validation.ts                  → frontend validation logic
  __tests__/validation.test.ts   → validation unit tests
```

---

## 🧠 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENTS.md (Bootloader)                    │
│              You are here. Load order below.                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌─────────────────┐ ┌───────────┐ ┌──────────────────┐
│  .agent/system/  │ │  Roles    │ │    Skills        │
│                  │ │           │ │                  │
│ orchestrator.md  │ │ Activated │ │ Tier 0: always   │
│ alignment.md     │ │ per task  │ │ Tier 1: tech     │
│ auto-learning.md │ │ context   │ │ Tier 2: on-demand│
└─────────────────┘ └───────────┘ └──────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Memory (Taxonomie Cognitive)                 │
│  working/ · episodic/ · semantic/ · procedural/             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Boot Sequence

Every agent session MUST follow this loading order:

### Phase 1 — Core (Always Load, in this order)

1. **`00-reasoning.md`** (Skill 00) — FIRST TOKEN, always
2. **`AGENTS.md`** — Identity, structure, protocols
3. **`.agent/system/alignment.md`** — Constraints (IMMUTABLE)
4. **`.agent/system/orchestrator.md`** — Context routing engine (IMMUTABLE)
5. **`.agent/system/auto-learning.md`** — Knowledge enrichment (IMMUTABLE)
6. **`11-agent-behavior.md`** (Skill 11) — Behavior rules

### Phase 2 — Skill Routing (Task-Dependent)

Load skills by tier based on the task:

- **Tier 0** — `.agent/rules/tier-0/` → ALWAYS loaded
- **Tier 1** — `.agent/rules/tier-1/` → Load if technical task
- **Tier 2** — `.agent/rules/tier-2/` → Load specific skill on-demand

### Phase 3 — Role + Context Activation (Task-Dependent)

Load the appropriate **role** from `.agent/roles/` and the relevant **context map section** from `.agent/memory/semantic/`.

---

## 🔧 Roles

Active roles for this repository:

- `frontend-engineer.md`
- `frontend-accessibility-reviewer.md`

Use both roles for forms, authentication UX, navigation and route guards.

## 🧭 Task Detection Table

| Signal keywords | Domain | Tier 1 Skills | Tier 2 Skills | Context Map |
|---|---|---|---|---|
| page, route, app router, navigation | Routing/UI | `01-nextjs-typescript.md`, `02-ui-tailwind.md` | — | `routes-and-pages.md`, `codebase-overview.md` |
| form, validation, error message, signup, login | Forms/Auth UX | `01-nextjs-typescript.md`, `03-security.md` | — | `api-integration.md`, `routes-and-pages.md` |
| token, localStorage, authorization, session | Security | `03-security.md` | — | `api-integration.md` |
| bearer, 401, 403, session expirée, unauthorized | Auth Error Handling | `03-security.md`, `01-nextjs-typescript.md` | — | `api-integration.md`, `routes-and-pages.md` |
| events, invitation, join, exclusions, draw, assignment | Event Flows | `01-nextjs-typescript.md`, `02-ui-tailwind.md`, `03-security.md` | — | `routes-and-pages.md`, `api-integration.md` |
| loading, spinner, empty state, fallback | Async UX States | `02-ui-tailwind.md`, `01-nextjs-typescript.md` | — | `codebase-overview.md`, `routes-and-pages.md` |
| NEXT_PUBLIC_API_URL, fetch, api url, env | API Configuration | `01-nextjs-typescript.md`, `03-security.md` | — | `api-integration.md` |
| test, jest, regression, bug | Testing/Debug | `06-testing.md` | — | `codebase-overview.md`, `known-pitfalls.md` |
| responsive, mobile, accessibility, a11y | UX/A11y | `02-ui-tailwind.md` | — | `routes-and-pages.md` |

---

<CRITICAL_DIRECTIVES>

1. **Static analysis is a hard gate** — lint + typecheck must pass before claiming completion
2. **NEVER disable rules silently** — fix the code, not the gate
3. **`@ts-ignore`, `@ts-nocheck` FORBIDDEN** by default
4. **Destructive operations require explicit confirmation** — ⚠️ warn first
5. **Never expose secrets or credentials** in responses

</CRITICAL_DIRECTIVES>

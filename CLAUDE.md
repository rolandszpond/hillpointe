# CLAUDE.md

This file configures AI coding assistants (Claude Code, Cursor, Copilot, etc.) for this project.
Read it before generating any code or making suggestions.

---

## Project Overview

A Leasing & Tours CRM for apartment leasing teams. The core feature is a **status-driven automation engine**: when a prospect's pipeline status changes, the system automatically generates follow-up tasks for the leasing agent. Built as a take-home technical assessment for Hillpointe HP Labs.

---

## Project Structure

```
/
├── web/              # React + Vite + Tailwind frontend
├── api/              # Node.js + Express backend (to be added)
├── packages/
│   └── contracts/    # Zod schemas + inferred TypeScript types (shared)
└── package.json
```

**The `packages/contracts` layer is the architectural centerpiece.** Both `web/` and `api/` import from it. Never duplicate a type or schema across apps — it lives in contracts only.

---

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict mode, `"strict": true`, no `any`) |
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| ORM / DB | Prisma + Neon (PostgreSQL) |
| Contracts | `packages/contracts` — Zod schemas + inferred types |
| Package manager | npm |

---

## TypeScript Rules

- `strict: true` in all tsconfig files. No exceptions.
- No `any`. Use `unknown` + narrowing, or Zod `.parse()`.
- Infer types from Zod schemas — don't duplicate type definitions.

```ts
// contracts/src/prospect.ts
export const ProspectSchema = z.object({ ... });
export type Prospect = z.infer<typeof ProspectSchema>;
```

- Both frontend and backend import `Prospect` from `@repo/contracts`, never from each other.

---

## Domain Model

| Entity | Key Fields |
|---|---|
| `Unit` | id, name/number, status: `available \| held \| leased` |
| `Prospect` | id, name, contact info, assignedUnitId (nullable), status (pipeline) |
| `Tour` | id, prospectId, unitId, scheduledTime, outcome (nullable) |
| `Task` | id, title, dueDate, assignee, prospectId, state: `open \| done` |
| `ActivityEvent` | id, type, timestamp, prospectId, unitId (nullable), summary |

### Prospect Pipeline

```
new → contacted → tour_scheduled → toured → application → leased
                                                        ↳ lost
```

---

## Automation Rule Engine

The rule engine is the riskiest logic — keep it clean and extensible.

**Pattern:** A rule is a pure function `(transition) => Effect[]`. Register rules in a central map; the engine iterates and applies them. Adding a new rule = adding one entry, not editing existing code.

```ts
// Example shape
type Rule = {
  toStatus: ProspectStatus;
  apply: (ctx: RuleContext) => Promise<void>;
};
```

**Automation rules:**

| Transition to | Effect |
|---|---|
| `contacted` | Create task "Send tour availability to {name}", due +2 days |
| `tour_scheduled` | Create task "Confirm tour 24h prior", due = tour time − 1 day |
| `toured` | Create task "Send application link", due +1 day |
| `application` | Create task "Review application", due +3 days |
| `leased` | Mark unit `leased`; auto-close open tasks; log activity |
| `lost` | Auto-close open tasks; log activity |

Every status change must append an `ActivityEvent`.

---

## API Conventions

- REST endpoints. JSON in/out.
- Request bodies validated with Zod (from contracts) on the server.
- Return typed responses — frontend infers types from the same Zod schemas.
- Error responses: `{ error: string }` with appropriate HTTP status.

---

## Frontend Conventions

- Components in `web/src/components/`
- Pages/routes in `web/src/pages/`
- Use Tailwind utility classes — no custom CSS files unless absolutely necessary
- Form validation derives from the shared Zod schemas (e.g. via `react-hook-form` + `@hookform/resolvers/zod`)
- Optimistic UI on status changes (Tier 4): update local state immediately, roll back on error

---

## Commit Convention

Small, frequent commits that tell a story. Prefix with tier:

```
tier0: scaffold project structure
tier0: add contracts package with Unit and Prospect schemas
tier0: implement Unit CRUD endpoints
tier1: add rule engine skeleton
tier1: implement contacted → task automation
```

Commit after each meaningful unit of work, not at end-of-day dumps.

---

## Dev Commands

```bash
# frontend
cd web && npm install && npm run dev

# backend (once api/ exists)
cd api && npm install && npm run dev

# typecheck
npx tsc --noEmit   # run from web/ or api/
```

---

## Tier Ladder (ordered — do not skip)

| Tier | Scope | Status |
|---|---|---|
| 0 — MVP | Scaffold + contracts + Unit & Prospect CRUD + list/detail views + manual status change | ⬜ |
| 1 — Automation | Rule engine + tasks list + activity timeline | ⬜ |
| 2 — Tours | Schedule/reschedule + outcome flips status + no double-booking | ⬜ |
| 3 — Filter | Search prospects + filter by status/unit/assignee | ⬜ |
| 4 — Polish | Optimistic UI + Zod-derived form validation + loading/error/empty states | ⬜ |
| 5 — Tests | Rule engine unit tests + ≥1 API integration test + CI workflow | ⬜ |

---

## What AI Tools Should and Shouldn't Do Here

**Good uses:**
- Scaffold boilerplate (monorepo config, tsconfig, Vite config)
- Generate Zod schemas from the domain model above
- Suggest rule engine patterns
- Write test cases for the automation rules

**Not helpful / avoid:**
- Generating entire features in one shot without review
- Bypassing the contracts layer (putting types directly in app code)
- Using `any` or `as` casts to silence type errors
- Skipping tiers or generating Tier 2+ code before Tier 0 is working

Every line in this repo should be understandable and defensible in a live code walk.

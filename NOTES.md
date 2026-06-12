## Tier 0 — MVP

I created `CLAUDE.md` to act as the project constitution for AI tools. It enforces strict rules for AI to follow when prompting, like skipping ahead to later features before earlier ones are done.

I used Claude to help set the scaffolding for the web, contracts, and api folders. The `web` includes React, Vite, and Tailwind, with initial Prospect list and detail pages. `packages/contracts` with Zod schemas for `Unit` and `Prospect`. The `api` includes basic Express + Prisma CRUD endpoints for `Prospects` and `Units` with request bodies being validated against the shared Zod schemas from the contracts layer. I chose `Neon` postgres for the database and created a basic seed file to use to get things running.

Time spent ~2 hrs

---

## Tier 1 — Automation

Added `Task` and `ActivityEvent` models and contracts schemas. Built a rule engine that fires on every prospect status change, it logs an activity event and creates the appropriate follow-up task. The prospect detail page shows a tasks list with mark-done and an activity timeline.

Time spent: ~1 hr

---

## Tier 2 - Tours

Added a `Tour` model and contracts schema. Built schedule, reschedule, and outcome endpoints. Recording a tour outcome maps to a prospect status change (`toured`, `no_show` → `lost`, `cancelled` → `contacted`), which fires the Tier 1 rule engine the same way a manual status change does. The prospect detail page has a tours section where you can schedule a tour, record an outcome, or reschedule inline. Double-booking is prevented with a unique constraint on `(unitId, scheduledTime)` at the database level.

Time spent: ~1 hr

## AI tools

Used Claude Code throughout, working one step at a time and reviewing each piece before moving to the next. The `CLAUDE.md` constitution kept the AI from skipping tiers, using `any`, or bypassing the contracts layer.

## What I would do next

- Currently, there's no tour length, so double booking the unit only checks by the minute, I would add a length for tours for maybe 60 mins to check against to prevent double bookings.
- I would add transactions to the database calls instead of running them parallel incase one requests fails, the whole thing would rollback instead of having incomplete or mismatched data.
- I would create endpoints that consolidate queries and data needed for each page instead of running multiple queries together to help with database connections.
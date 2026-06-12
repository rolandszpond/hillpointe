## Tier 0 — MVP

I created `CLAUDE.md` to act as the project constitution for AI tools. It enforces strict rules for AI to follow when prompting, like skipping ahead to later features before earlier ones are done.

I used Claude to help set the scaffolding for the web, contracts, and api folders. The `web` includes React, Vite, and Tailwind, with initial Prospect list and detail pages. `packages/contracts` with Zod schemas for `Unit` and `Prospect`. The `api` includes basic Express + Prisma CRUD endpoints for `Prospects` and `Units` with request bodies being validated against the shared Zod schemas from the contracts layer. I chose `Neon` postgres for the database and created a basic seed file to use to get things running.

Time spent ~2 hrs

---

## Tier 1 — Automation

Added `Task` and `ActivityEvent` models and contracts schemas. Built a rule engine that fires on every prospect status change, it logs an activity event and creates the appropriate follow-up task. The prospect detail page shows a tasks list with mark-done and an activity timeline.

**Tradeoffs:**
- Need to add transactions to queries that send multiple requests instead of running in parallel to avoid incomplete or mismatching data changes.

Time spent: ~1 hr

---

## AI tools

Used Claude Code throughout, working one step at a time and reviewing each piece before moving to the next. The `CLAUDE.md` constitution kept the AI from skipping tiers, using `any`, or bypassing the contracts layer.

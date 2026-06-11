## Phase 1 - Foundation

I created `CLAUDE.md` to act as the project constitution for AI tools. It enforces strict rules for AI to follow when prompting, like skipping ahead to later features before earlier ones are done.

I used Claude to help set the scaffolding for the web, contracts, and api folders. The `web` includes React, Vite, and Tailwind, with initial Prospect list and detail pages. `packages/contracts` with Zod schemas for `Unit` and `Prospect`. The `api` includes basic Express + Prisma CRUD endpoints for `Prospects` and `Units` with request bodies being validated against the shared Zod schemas from the contracts layer. I chose `Neon` postgres for the database and created a basic seed file to use to get things running.
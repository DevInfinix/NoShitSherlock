# NoShitSherlock — Context & Working Progress

> **Purpose**: This file maintains the exact operational state and memory of the project so that any session can immediately resume with full context. It is updated upon every milestone and key change.

---

## 1. Project Overview & Quick Reference

- **Product**: NoShitSherlock — Open-source noir detective web game.
- **Repository**: [`https://github.com/DevInfinix/NoShitSherlock`](https://github.com/DevInfinix/NoShitSherlock) (Public)
- **Primary Branch**: `main`
- **Lead Tech Stack**: Next.js 16 (App Router, Turbopack, standalone output), React 19, TypeScript strict, Tailwind CSS v4, PostgreSQL 17 (Neon Serverless in production, Docker Compose locally), Drizzle ORM, Better Auth, Resend, Bun 1.4+, Biome 2.5, Husky, commitlint.
- **Production Target**: Subdomain of `thesamstudios.in`.
- **Database Architecture**: Neon PostgreSQL 17 with dual-connection configuration (`DATABASE_URL` pooled runtime, `DATABASE_URL_UNPOOLED` direct migrations).

---

## 2. Current State (As of Phase M0.5 Intermediate Step)

### What Was Accomplished
1. **M0 Foundation Fully Implemented & Pushed**:
   - Initialized Next.js 16 and Bun project layout.
   - Configured Tailwind CSS v4 with custom noir theme tokens.
   - Configured Biome linter/formatter with Tailwind directive support.
   - Configured Husky git hooks (`pre-commit` -> `lint-staged`, `commit-msg` -> `commitlint`).
   - Added Apache-2.0 `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, issue/PR templates, and Dependabot config.
   - Authored multi-stage `Dockerfile` and `docker-compose.yml`.
   - Built GitHub Actions CI workflow running PostgreSQL 17, Biome, TypeScript typecheck, tests, and build. All runs passing green.
   - Created `src/proxy.ts`, `src/app/api/health/route.ts`, and `tests/health.test.ts`.
2. **GitHub Presence Enhanced**:
   - Transferred official brand banner to `.github/assets/banner.png`.
   - Published high-impact, humanized `README.md` containing game pitch, 3-act mechanics breakdown, system architecture with Mermaid sequence diagram, self-hosting guide, and contributor acknowledgments (Ayurda & Shashwat).
   - Added trending repository topics and an evocative repository description on GitHub.
3. **Execution Tracking Established**:
   - Authored `tasks.md` with detailed phase breakdowns, starred subtasks, and progress indicators.
   - Authored `progress.md` (this file).

---

## 3. Pending Questions & Clarification Blockers

Before advancing to Phase M1 (Database Architecture), the user requested clarifications regarding placeholder assumptions:

1. **`.github/FUNDING.yml` Platforms**:
   - Current state: contains `github: [DevInfinix]`.
   - Need confirmation on which funding services to enable (e.g., GitHub Sponsors username, Ko-fi, Open Collective, Patreon, Buy Me a Coffee, custom link, or remove entirely).
2. **Security Vulnerability Reporting Email in `SECURITY.md`**:
   - Current state: line 17 previously used placeholder `security@thesamstudios.in`.
   - Need actual contact email address or preference to route through GitHub Private Vulnerability Reporting only.
3. **Outbound Notification & OTP Sender Email in `.env.example`**:
   - Current state: line 22 has `EMAIL_FROM="NoShitSherlock <detective@thesamstudios.in>"`.
   - Need intended sender address / domain for Resend verification emails.

---

## 4. Next Immediate Steps (Upon Clarification)

1. **Update Assumed Files**:
   - Patch `SECURITY.md`, `.github/FUNDING.yml`, and `.env.example` with user-specified email addresses and funding settings.
   - Commit and push those fixes with Conventional Commits.
   - Mark Phase M0.5 items complete in `tasks.md` and update `progress.md`.
2. **Proceed to Phase M1 (Database & Content Architecture)**:
   - Create schema files in `src/db/schema/`:
     - `auth.ts` (Better Auth tables)
     - `teams.ts` (`teams`, `team_members`)
     - `content.ts` (`cases`, `assets`, `sections`, `questions`, `question_options`, `clues`, `hints`)
     - `runtime.ts` (`game_sessions`, `session_question_states`, `session_answers`, `session_clues`, `pinboard_*`)
     - `legal.ts` (`legal_acceptances`)
   - Create `src/db/client.ts` with pooled Neon connection.
   - Author Zod schema in `src/lib/case-schema.ts` for validating `case.json`.
   - Generate initial migration with `bun run db:generate`.
   - Build idempotent seeder in `src/db/seed.ts`.
   - Author database integration tests in `tests/db.test.ts`.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

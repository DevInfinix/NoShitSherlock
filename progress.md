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
4. **Configuration Assumptions Resolved**:
   - Updated `SECURITY.md` contact email to `admin@thesamstudios.in`.
   - Updated `.env.example` `EMAIL_FROM` to standard generic placeholder `NoShitSherlock <auth@yourdomain.com>`.
   - Updated `.github/FUNDING.yml` to Ko-fi platform (`ko_fi: DevInfinix`).

---

## 3. Pending Approval Before Phase M1

All Phase M0 and M0.5 intermediate adjustments are complete and clean. Awaiting user authorization to proceed to **Phase M1: Database Architecture, Migrations & Content Pipeline**.

---

## 4. Next Immediate Steps (Phase M1: Database & Content Pipeline)

Upon approval, the exact plan for Phase M1 includes:
1. **Schema Definition (`src/db/schema/`)**:
   - `auth.ts` (Better Auth tables: `user`, `session`, `account`, `verification`)
   - `teams.ts` (`teams`, `team_members`)
   - `content.ts` (`cases`, `assets`, `sections`, `questions`, `question_options`, `clues`, `hints`, asset relation tables)
   - `runtime.ts` (`game_sessions`, `session_question_states`, `session_answers`, `session_clues`, `hint_requests`, `pinboard_submissions`, `pinboard_placements`)
   - `legal.ts` (`legal_acceptances`)
2. **Database Client (`src/db/client.ts`)**:
   - Pooled PostgreSQL connection client using Drizzle ORM and `pg` with Neon / local support.
3. **Zod Case Validation (`src/lib/case-schema.ts`)**:
   - Complete schema validator for authored `case.json`.
4. **Initial Migration (`bun run db:generate`)**:
   - Generate committed SQL migration in `drizzle/`.
5. **Case Seeding Pipeline (`src/db/seed.ts`)**:
   - Author Case 01 dossier content and implement idempotent database seeder.
6. **Database Integration Tests (`tests/db.test.ts`)**:
   - Verify transaction isolation, row locking (`SELECT ... FOR UPDATE`), constraints, and seed idempotency.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

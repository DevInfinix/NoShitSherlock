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

## 2. Current State (Phase M1: In Progress)

### What Was Accomplished
1. **M0 Foundation Fully Completed**:
   - Initialized Next.js 16 and Bun project layout.
   - Configured Tailwind CSS v4 with custom noir theme tokens.
   - Configured Biome linter/formatter with Tailwind directive support.
   - Configured Husky git hooks (`pre-commit` -> `lint-staged`, `commit-msg` -> `commitlint`).
   - Added Apache-2.0 `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, issue/PR templates, and Dependabot config.
   - Authored multi-stage `Dockerfile` and `docker-compose.yml`.
   - Built GitHub Actions CI workflow running PostgreSQL 17, Biome, TypeScript typecheck, tests, and build. All runs passing green.
2. **GitHub Presence & Sponsorship Configured**:
   - Transferred official brand banner to `.github/assets/banner.png`.
   - Published comprehensive `README.md` containing game pitch, 3-act mechanics breakdown, system architecture with Mermaid sequence diagram, self-hosting guide, and contributor acknowledgments.
   - Integrated visible Ko-fi badge in `README.md` header and dedicated "Support the Investigation" section.
   - Configured `.github/FUNDING.yml` with `ko_fi: DevInfinix` and custom link.
3. **Execution Tracking Established**:
   - Authored `tasks.md` and `progress.md`.
4. **Phase M1 Database Architecture Built**:
   - Created full Drizzle ORM schemas in `src/db/schema/`: `auth.ts`, `teams.ts`, `content.ts`, `runtime.ts`, `legal.ts`, `index.ts` covering 24 tables, check constraints, partial indexes, and foreign key cascades.
   - Created database client in `src/db/client.ts` with connection pooling support.
   - Created strict Zod case validator in `src/lib/case-schema.ts` with unit test suite in `tests/case-schema.test.ts`.
   - Generated initial committed migration file: `drizzle/0000_steep_lenny_balinger.sql`.
   - Committed and pushed changes under commit `44eec57`.

---

## 3. Pending Information & Environment Configuration

To test applying the generated migrations (`bun run db:migrate`) and run the database seeder against Neon PostgreSQL, we require the following environment variables:
1. `DATABASE_URL`: Neon pooled connection string (e.g., `postgresql://...pooler...?sslmode=require`).
2. `DATABASE_URL_UNPOOLED`: Neon direct unpooled connection string (used by `drizzle-kit` for schema migrations).

---

## 4. Next Immediate Steps (Upon Receiving Database Credentials)

1. Store credentials in `.env.local` (kept git-ignored).
2. Execute `bun run db:migrate` to apply all 24 tables to Neon.
3. Build the idempotent Case 01 seeder in `src/db/seed.ts`.
4. Run `bun run db:seed` and verify zero-error execution.
5. Create database integration test in `tests/db.test.ts` verifying constraints and row locking.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

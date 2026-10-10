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

## 2. Current State (Phase M1: Completed)

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
4. **Phase M1 Database Architecture Fully Delivered**:
   - Configured Neon MCP globally and authenticated via `neonctl`.
   - Provisioned Neon PostgreSQL 17 project `noshitsherlock` (ID: `morning-morning-30814320`) in TheSamStudios organization.
   - Stored connection strings in `.env.local` (pooled and unpooled).
   - Created full Drizzle ORM schemas in `src/db/schema/`: `auth.ts`, `teams.ts`, `content.ts`, `runtime.ts`, `legal.ts`, `index.ts` covering 24 tables, check constraints, partial indexes, and foreign key cascades.
   - Created database client in `src/db/client.ts` with connection pooling support.
   - Created strict Zod case validator in `src/lib/case-schema.ts` with unit test suite in `tests/case-schema.test.ts`.
   - Generated initial committed migration file: `drizzle/0000_steep_lenny_balinger.sql`.
   - Applied migrations to live Neon PostgreSQL 17 database (`bun run db:migrate`) successfully creating all 24 tables.
   - Authored Case 01 dossier specification in `content/cases/case-01-missing-ledger/case.json` with 5 sections and all 5 puzzle formats.
   - Implemented idempotent database seeder `src/db/seed.ts` (`bun run db:seed`) and verified duplicate-free execution.
   - Implemented database query tests in `tests/db.test.ts` passing 100%.

---

## 3. Pending Information & Next Milestone Authorization

Phase M1 is 100% complete.
Awaiting user authorization to proceed to **Phase M2: Authentication, Authorization & Team Management**.

---

## 4. Next Immediate Steps (Phase M2: Auth & Teams)

1. **Better Auth Server Setup (`src/server/auth.ts`)**:
   - Configure Better Auth with Drizzle adapter and Neon connection.
   - Set up Email OTP (6-digit one-time code with 10-minute expiry via Resend).
   - Configure OAuth providers: Google, GitHub, and Discord.
2. **Age Gate & Legal Consent Flow**:
   - Pre-registration consent screen verifying age 13+ and Terms/Privacy acceptance.
   - Store immutable records in `legal_acceptances`.
3. **Route Protection (`src/proxy.ts`)**:
   - Guard `(game)` routes against unauthenticated requests.
4. **Team Management Service (`src/server/services/team-service.ts`)**:
   - Team creation with 8-character cryptographic alphanumeric join code.
   - Join team, leave team, list team members, and role assignment (`owner` vs `member`).
   - Server Actions for team management (`src/server/actions/team-actions.ts`).
5. **Auth & Team Tests (`tests/auth.test.ts`, `tests/teams.test.ts`)**:
   - Validate team code uniqueness, member limits, role guards, and session isolation.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

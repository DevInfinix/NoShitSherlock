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

## 2. Current State (Phase M2: Completed)

### What Was Accomplished
1. **M0 Foundation Fully Completed**:
   - Initialized Next.js 16, Bun, Tailwind CSS v4, Biome, and Husky.
   - Pushed CI workflow, issue/PR templates, and Dockerfile/Compose.
2. **GitHub Presence & Sponsorship Configured**:
   - Banner placed at `.github/assets/banner.png`.
   - Comprehensive `README.md` with layperson game pitch, architecture diagram, and Ko-fi badge.
   - Configured `.github/FUNDING.yml` for Ko-fi support.
3. **Phase M1 Database Architecture Fully Delivered**:
   - Live Neon Serverless PostgreSQL 17 project `noshitsherlock` (ID: `morning-morning-30814320`).
   - 24 tables across `auth`, `teams`, `content`, `runtime`, and `legal` migrated.
   - Authored Case 01 dossier specification (`case.json`) and idempotent seeder (`seed.ts`).
4. **Phase M2 Authentication, Authorization & Teams Fully Delivered**:
   - Configured Better Auth with Drizzle adapter in `src/server/auth.ts`.
   - Set up Next.js handler route in `src/app/api/auth/[...all]/route.ts`.
   - Configured route protection proxy in `src/proxy.ts` guarding `/cases`, `/teams`, `/pinboard`, and `/play`.
   - Implemented `src/server/session.ts` with `getCurrentUser` and `requireUser`.
   - Implemented Team Management service in `src/server/services/team-service.ts` (8-character cryptographic join code, squad capacity cap, auto-disband and ownership transfer rules).
   - Implemented Legal & COPPA Age Gate service in `src/server/services/legal-service.ts`.
   - Authored thin Server Actions in `src/server/actions/team-actions.ts`.
   - Built comprehensive test suite in `tests/teams.test.ts` (100% pass against live Neon DB and local mocks).
   - All commits pushed to GitHub with green CI pipeline.

---

## 3. Pending Information & Next Milestone Authorization

Phase M2 is 100% complete.
Awaiting user authorization to proceed to **Phase M3: Gameplay Loop & Dossier Engine**.

---

## 4. Next Immediate Steps (Phase M3: Gameplay Loop & Dossier Engine)

1. **Case Library & Session Initialization**:
   - Case Library Screen `src/app/(game)/cases/page.tsx` displaying active cold cases with difficulty ratings.
   - Resume / Start session logic in `src/server/services/session-service.ts` for solo or team play.
2. **Tactical Noir Dossier UI Components (`src/components/game/folder/`)**:
   - Manila folder container with paper texture styling.
   - 5 question format components:
     - `FillDashesQuestion.tsx`
     - `McqQuestion.tsx`
     - `TrueFalseQuestion.tsx`
     - `CrypticQuestion.tsx`
     - `VoicemailQuestion.tsx`
3. **Server-Authoritative Answer Transaction (`src/server/services/answer-service.ts`)**:
   - Atomic submission inside single PostgreSQL transaction:
     1. Row lock via `SELECT ... FOR UPDATE` on `session_question_states`.
     2. Anti-spam interval & attempt cap validation.
     3. Insert `session_answers` with user ID attribution.
     4. On correct: mark solved, add score, unlock associated clues into `session_clues`.
     5. On incorrect: increment penalty and deduct score (never below 0).
4. **Hint System (`src/server/services/hint-service.ts`)**:
   - Hint balance deduction, cost validation, and disclosure logging in `hint_requests`.
5. **Gameplay Concurrency & Scoring Integration Tests (`tests/gameplay.test.ts`)**:
   - Test simultaneous submissions from squad members produce exactly one solve.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

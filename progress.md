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

## 2. Current State (Phase M3: Completed)

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
   - Built comprehensive test suite in `tests/teams.test.ts`.
5. **Phase M3 Gameplay Loop & Dossier Engine Fully Delivered**:
   - Implemented Game Session & Case Library service (`src/server/services/game-session-service.ts`) with access validation, sanitized dossier generation, and active session listing.
   - Implemented Server-Authoritative Answer Submission Engine (`src/server/services/gameplay-service.ts`) operating in an atomic PostgreSQL transaction with row-level locking (`SELECT ... FOR UPDATE`), anti-spam rate limiting, penalty point clamping (score >= 0), and automatic clue unlocking into `session_clues`. Zero leakage of correct answers or options.
   - Implemented Hint System Service (`src/server/services/hint-service.ts`) handling cost deductions and unlock deduplication via `hint_requests`.
   - Authored typed Server Actions (`src/server/actions/gameplay-actions.ts`) for session initiation, dossier retrieval, answer verification, and hint unlocks.
   - Installed approved tech-stack packages `motion` and `zustand`, creating `src/store/folder-store.ts`.
   - Created the Tactical Noir Dossier UI (`src/components/game/folder/`):
     - `DossierFolder.tsx`: Manila evidence folder surface with section navigation tabs and Motion page turns.
     - `FillDashesQuestion.tsx`: Interactive character dash inputs with keyboard navigation.
     - `McqQuestion.tsx`: Clean typographic multiple-choice deduction cards.
     - `TrueFalseQuestion.tsx`: Witness testimony assertion verification switches.
     - `CrypticQuestion.tsx`: Monospace cipher text viewer with detective decoding scratchpad.
     - `VoicemailQuestion.tsx`: Retro audio cassette wiretap player with synced transcript reveal.
   - Built Server Component pages for Case Archive (`src/app/(game)/cases/page.tsx`) and Case Dossier (`src/app/(game)/cases/[slug]/page.tsx`).
   - Built comprehensive test suite in `tests/gameplay.test.ts` covering session lifecycle, answer scoring, clue unlocking, attempt caps, hint deductions, and concurrent team submission deduplication (15/15 tests passing).

---

## 3. Pending Information & Next Milestone Authorization

Phase M3 is 100% complete.
Ready to proceed to **Phase M4: Detective Notebook & Chronological Pinboard**.

---

## 4. Next Immediate Steps (Phase M4: Detective Notebook & Chronological Pinboard)

1. **Detective Notebook Drawer (`src/components/game/notebook/`)**:
   - Slide-out leather/cloth field notebook panel.
   - Filter unlocked clues by suspect, crime scene, forensics, or timeline tags.
   - Clue inspection modal showing high-res evidence image, transcript quote, and timestamp note.
   - Zustand notebook state store (`src/store/notebook-store.ts`).
2. **Chronological Evidence Pinboard (`src/components/game/pinboard/`)**:
   - Corkboard surface view rendered upon completing Section 5.
   - Drag-and-drop timeline builder powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
   - Keyboard accessibility and touch support for clue card ordering.
   - Dynamic SVG red yarn lines connecting cards in placed sequence.
   - Server-side pinboard validation service (`src/server/services/pinboard-service.ts`) verifying submission against `clues.chronological_order` in one atomic transaction.
3. **Case Solved & Results Screen**:
   - Case solved debriefing screen with final score, time taken, penalty breakdown, and detective rank badge.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

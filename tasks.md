# NoShitSherlock — Master Task Registry

This document tracks all project tasks across development milestones with granular sub-tasks. It serves as the single source of truth for engineering execution and is updated as requirements evolve.

---

## Task Status Legend
- `[x]` **Completed**
- `[/]` **In Progress**
- `[ ]` **Pending**
- `[!]` **Blocked / Awaiting Clarification**

---

## Phase M0: Foundation & Workspace Scaffolding

### Repository Initialization & Project Setup
- [x] ★ Initialize Next.js 16 (App Router, Turbopack, standalone output) with React 19 and TypeScript strict mode.
- [x] ★ Configure Bun (v1.4+) as the package manager, task runner, and test environment.
- [x] ★ Configure Tailwind CSS v4 using `@tailwindcss/postcss` with noir visual tokens (`--ink`, `--ink-raised`, `--oxblood`, `--evidence-red`, `--paper`, `--paper-muted`, `--brass`, `--smoke`).
- [x] ★ Set up Biome v2.5 for sub-millisecond linting and formatting with Tailwind CSS directive support.
- [x] ★ Set up strict `tsconfig.json` (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, path alias `@/*` -> `./src/*`).
- [x] ★ Configure Husky v9 git hooks:
  - [x] `pre-commit`: runs `lint-staged` with Biome autofix.
  - [x] `commit-msg`: validates Conventional Commits via `@commitlint/cli`.
- [x] ★ Configure `.gitignore` to track `bun.lock` while ignoring `.env*.local`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `.kilo/`, `.vscode/`, and raw assets in `content/inbox/`.
- [x] ★ Create `.env.example` documenting all runtime and migration environment variables.

### Licensing, Community Health & Project Presence
- [x] ★ Add Apache License 2.0 (`LICENSE`).
- [x] ★ Author `CONTRIBUTING.md` defining branch conventions (`type/<issue-number>-slug`), Conventional Commits, and PR quality gates.
- [x] ★ Author `SECURITY.md` with vulnerability reporting procedures.
- [x] ★ Create GitHub templates:
  - [x] Bug report issue template (`.github/ISSUE_TEMPLATE/bug_report.yml`).
  - [x] Feature request issue template (`.github/ISSUE_TEMPLATE/feature_request.yml`).
  - [x] Issue configuration (`.github/ISSUE_TEMPLATE/config.yml`).
  - [x] Pull request template (`.github/PULL_REQUEST_TEMPLATE.md`).
- [x] ★ Author comprehensive `README.md` featuring:
  - [x] Official header banner (`.github/assets/banner.png`).
  - [x] High-visibility badges (CI, stars, forks, issues, license, tech stack).
  - [x] Layman game pitch highlighting tactile noir atmosphere, zero hand-holding, collaborative squad play, and fast performance.
  - [x] Core 3-act progression guide (Investigation Dossier ➔ Detective Notebook ➔ Chronological Pinboard).
  - [x] Mockup gallery grid placeholders for case folder, notebook, and timeline board.
  - [x] Server-authoritative architecture overview with an end-to-end Mermaid transaction sequence diagram.
  - [x] Detailed self-hosting & local Docker setup instructions.
  - [x] Special Thanks credits to Ayurda (Visual Assets) and Shashwat (Case Content).
  - [x] Legal reservation for brand marks and proprietary case content exemption.

### Containerization & CI/CD
- [x] ★ Author multi-stage `Dockerfile` (`oven/bun:1-alpine` builder ➔ `node:22-alpine` non-root runner with healthcheck on `/api/health`).
- [x] ★ Author `docker-compose.yml` orchestrating PostgreSQL 17 container and standalone web app container.
- [x] ★ Create `.github/workflows/ci.yml` running PostgreSQL 17 service container, Biome linting, TypeScript typechecking, Bun tests, and Next.js standalone build.
- [x] ★ Add `.github/dependabot.yml` for npm and GitHub Actions dependency monitoring.
- [x] ★ Set up healthcheck route `src/app/api/health/route.ts` and automated route test `tests/health.test.ts`.
- [x] ★ Provision remote GitHub repository `DevInfinix/NoShitSherlock` and verify initial CI pipeline pass.

---

## Phase M0.5: Intermediate Configuration Audit & Presence Refinements

- [x] ★ Copy header banner to `.github/assets/banner.png`.
- [x] ★ Add repository trending topics on GitHub (`detective-game`, `puzzle-game`, `mystery-game`, `web-game`, `interactive-fiction`, `multiplayer-game`, `nextjs`, `react19`, `typescript`, `bun`, `tailwind-css`, `drizzle-orm`, `neon-postgres`, `fullstack`, `open-source`).
- [x] ★ Add repository description on GitHub.
- [!] ★ Clarify and update `.github/FUNDING.yml` platforms (GitHub Sponsors, Ko-fi, Patreon, Open Collective, custom URL) per user preference.
- [!] ★ Clarify and update security reporting email in `SECURITY.md` (remove placeholder assumption).
- [!] ★ Clarify and update outbound email sender address `EMAIL_FROM` in `.env.example`.
- [x] ★ Create `tasks.md` and `progress.md` tracking frameworks.

---

## Phase M1: Database Architecture, Migrations & Content Pipeline

### Database Layer & Schemas (`src/db/schema/`)
- [ ] ★ Database Client & Pool Setup (`src/db/client.ts`):
  - [ ] Configure `pg` connection pool with SSL support for Neon Postgres in production.
  - [ ] Configure direct unpooled connection for `drizzle-kit` migrations.
  - [ ] Wrap Drizzle client with typed query logger for local development.
- [ ] ★ Auth Schema (`src/db/schema/auth.ts`):
  - [ ] `user` table (id, name, email, emailVerified, image, createdAt, updatedAt).
  - [ ] `session` table (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId).
  - [ ] `account` table (id, accountId, providerId, userId, accessToken, refreshToken, expiresAt, password).
  - [ ] `verification` table (id, identifier, value, expiresAt, createdAt, updatedAt).
- [ ] ★ Teams Schema (`src/db/schema/teams.ts`):
  - [ ] `teams` table (BIGINT IDENTITY PK, name, join_code 8-char random alphanumeric unique, owner_id FK to user, created_at).
  - [ ] `team_members` table (team_id FK, user_id FK, role ENUM `owner` | `member`, joined_at; composite PK `team_id, user_id`).
- [ ] ★ Content Schema (`src/db/schema/content.ts`):
  - [ ] `cases` table (id IDENTITY, slug UNIQUE, title, description, difficulty 1-5, max_score, is_active, created_at).
  - [ ] `assets` table (id IDENTITY, case_id FK, asset_key, asset_type ENUM `IMAGE`|`AUDIO`|`PDF`|`DOCUMENT`, url, mime_type, alt_text; UNIQUE `case_id, asset_key`).
  - [ ] `sections` table (id IDENTITY, case_id FK, section_order > 0, title, narrative, folder_page_asset_id, time_limit_seconds; UNIQUE `case_id, section_order`).
  - [ ] `questions` table (id IDENTITY, section_id FK, question_key, question_type ENUM `FILL_DASHES`|`MCQ`|`TRUE_FALSE`|`CRYPTIC`|`VOICEMAIL_TRANSCRIPT`, prompt, placeholder_text, correct_answer [NULL for MCQ], points >= 0, max_attempts default 5, penalty_per_wrong >= 0, sort_order, metadata JSONB; UNIQUE `section_id, question_key`).
  - [ ] `question_options` table (id IDENTITY, question_id FK, option_text, is_correct, sort_order; UNIQUE `question_id, sort_order`; partial unique index enforcing max 1 correct option per question).
  - [ ] `question_assets` table (question_id FK, asset_id FK, usage_type; composite PK `question_id, asset_id`).
  - [ ] `clues` table (id IDENTITY, case_id FK, clue_key, title, clue_text, chronological_order > 0, metadata JSONB; UNIQUE `case_id, clue_key`, UNIQUE `case_id, chronological_order`).
  - [ ] `clue_assets` table (clue_id FK, asset_id FK; composite PK `clue_id, asset_id`).
  - [ ] `question_clues` table (question_id FK, clue_id FK; composite PK `question_id, clue_id`).
  - [ ] `hints` table (id IDENTITY, question_id FK, hint_text, cost_points >= 0, hint_order; UNIQUE `question_id, hint_order`).
- [ ] ★ Runtime Progress Schema (`src/db/schema/runtime.ts`):
  - [ ] `game_sessions` table (id IDENTITY, case_id FK, user_id FK nullable, team_id FK nullable, status ENUM `IN_PROGRESS`|`COMPLETED`|`ABANDONED`, current_section_id, score >= 0, hint_balance >= 0, wrong_attempts >= 0, started_at, completed_at, total_time_seconds >= 0; CHECK exactly one of user_id/team_id set; partial unique indexes for max 1 `IN_PROGRESS` per user/case and team/case).
  - [ ] `session_question_states` table (session_id FK, question_id FK, attempts_used, is_solved, last_attempt_at, solved_at; composite PK `session_id, question_id`).
  - [ ] `session_answers` table (id IDENTITY, session_id FK, question_id FK, answered_by_user_id FK, submitted_answer, is_correct, time_taken_ms, hint_used, created_at).
  - [ ] `session_clues` table (session_id FK, clue_id FK, source_question_id FK, unlocked_at; composite PK `session_id, clue_id`).
  - [ ] `hint_requests` table (id IDENTITY, session_id FK, hint_id FK, cost_points, created_at; UNIQUE `session_id, hint_id`).
  - [ ] `pinboard_submissions` table (id IDENTITY, session_id FK, is_correct, score_awarded, penalty_applied, submitted_at).
  - [ ] `pinboard_placements` table (id IDENTITY, submission_id FK, clue_id FK, placed_position > 0, is_correct_position; UNIQUE `submission_id, clue_id`, UNIQUE `submission_id, placed_position`).
- [ ] ★ Legal & Compliance Schema (`src/db/schema/legal.ts`):
  - [ ] `legal_acceptances` table (id IDENTITY, user_id FK, document_version, is_over_13 BOOLEAN, terms_accepted_at, privacy_accepted_at, marketing_opt_in BOOLEAN).

### Migration Pipeline & Seed Automation
- [ ] ★ Drizzle Migration Generation:
  - [ ] Run `bun run db:generate` to produce initial SQL migration under `drizzle/`.
  - [ ] Verify migration execution locally and in CI.
- [ ] ★ Zod Case Specification Validator (`src/lib/case-schema.ts`):
  - [ ] Validate complete structure of `content/cases/<case-slug>/case.json` (sections, questions, options, clues, hints, asset keys).
  - [ ] Validate question rules: MCQ must have NULL `correct_answer` and matching options; other types require explicit `correct_answer`.
  - [ ] Validate clue chronological ordering uniqueness.
- [ ] ★ Automated Case Seeder (`src/db/seed.ts`):
  - [ ] Parse `content/cases/` folders and load `case.json`.
  - [ ] Ensure idempotent execution (can run multiple times without duplicating data or breaking foreign keys).
  - [ ] Implement Case 01 content seed from authored dossiers.
- [ ] ★ Automated Case Import Tooling (Phase M1 CLI extension):
  - [ ] Build script to extract text & sections from `content/inbox/Cases PDF/`.
  - [ ] Generate optimized WebP assets into `public/cases/<case-slug>/images/`.
  - [ ] Build `asset-manifest.json` with provenance and alt-text drafts.
- [ ] ★ Database Integration Tests (`tests/db.test.ts`):
  - [ ] Verify transaction isolation and row-level locking (`SELECT ... FOR UPDATE`).
  - [ ] Test unique constraints, partial indexes, and cascade delete behaviors.
  - [ ] Test idempotent seed execution.

---

## Phase M2: Authentication, Authorization & Team Management

### Better Auth Integration
- [ ] ★ Configure Better Auth server (`src/server/auth.ts`) with Drizzle adapter.
- [ ] ★ Set up authentication methods:
  - [ ] Email OTP passwordless login with 6-digit one-time code via Resend.
  - [ ] Standard Email/Password fallback.
  - [ ] Social OAuth providers: Google, GitHub, and Discord.
- [ ] ★ Implement 10-minute expiry, single-use, rate-limited email verification flow.
- [ ] ★ Implement Age Gate & Legal Consent Flow:
  - [ ] Pre-registration screen requiring confirmation of age (13+) and acceptance of Terms of Service & Privacy Policy.
  - [ ] Store immutable acceptance records in `legal_acceptances`.

### Route Protection & Session Guard
- [ ] ★ Configure `src/proxy.ts` (Next.js 16 route proxy) to guard `(game)` routes against unauthenticated requests.
- [ ] ★ Implement session helper utilities (`src/server/session.ts`) to resolve current user and active team.

### Team Management Services (`src/server/services/team-service.ts`)
- [ ] ★ Create team with cryptographic 8-character uppercase join code.
- [ ] ★ Join team with code validation and capacity checks.
- [ ] ★ List team members and show active sessions.
- [ ] ★ Transfer ownership and leave team logic (with session safety guards).
- [ ] ★ Server Actions for team UI: `createTeamAction`, `joinTeamAction`, `leaveTeamAction`.
- [ ] ★ Unit & integration tests for team authorization rules.

---

## Phase M3: Gameplay Loop & Dossier Engine

### Case Library & Session Initialization
- [ ] ★ Case Library Screen `src/app/(game)/cases/page.tsx`:
  - [ ] Display available active cold cases with difficulty ratings and briefing summaries.
  - [ ] Detect in-progress sessions and render prominent "Continue Investigation" state.
- [ ] ★ Session Start / Resume Service:
  - [ ] Atomic creation of `game_sessions` row for individual player or squad.
  - [ ] Resume existing `IN_PROGRESS` session with current section position and score.

### Tactical Noir Dossier UI (`src/components/game/folder/`)
- [ ] ★ Physical Dossier Layout:
  - [ ] Manila evidence folder container with paper texture shaders.
  - [ ] Section navigation tabs with typewriter headers and stamp badges.
  - [ ] Smooth page-turn transitions using Motion (`motion/react`).
- [ ] ★ 5 Progressive Puzzle Component Formats:
  - [ ] `FillDashesQuestion.tsx`: interactive letter dash inputs with keyboard navigation.
  - [ ] `McqQuestion.tsx`: evidence deduction selector with clean typographic indicators.
  - [ ] `TrueFalseQuestion.tsx`: witness testimony assertion switches.
  - [ ] `CrypticQuestion.tsx`: cipher text viewer with scratchpad note inputs.
  - [ ] `VoicemailQuestion.tsx`: retro audio cassette/wiretap player with synced transcript reveal.

### Server-Authoritative Answer Transaction (`src/server/services/answer-service.ts`)
- [ ] ★ Implement single-transaction submission logic:
  1. Acquire row lock on `session_question_states` via `SELECT ... FOR UPDATE`.
  2. Reject if already solved, max attempts exceeded, or submission interval too short (anti-spam).
  3. Insert attempt record into `session_answers` with user ID attribution.
  4. Update question state: increment `attempts_used`, update `last_attempt_at`.
  5. On correct answer: mark `is_solved = true`, record `solved_at`, add points to `game_sessions.score`, unlock associated clues into `session_clues`.
  6. On incorrect answer: increment `wrong_attempts`, deduct penalty points (clamped to 0 minimum).
- [ ] ★ Hint System (`src/server/services/hint-service.ts`):
  - [ ] Deduct hint penalty cost from session score.
  - [ ] Record unlock in `hint_requests` and reveal hint text.
- [ ] ★ Concurrency testing: verify two simultaneous team submissions produce exactly one solve award.

---

## Phase M4: Detective Notebook & Chronological Pinboard

### Detective Notebook Drawer (`src/components/game/notebook/`)
- [ ] ★ Slide-out leather/cloth field notebook panel.
- [ ] ★ Filter unlocked clues by suspect, crime scene, forensics, or timeline tag.
- [ ] ★ Detailed clue inspection modal showing high-res evidence image, transcript quote, and timestamp note.
- [ ] ★ Zustand notebook state store (`src/store/notebook-store.ts`) for UI opening/closing state.

### Chronological Evidence Pinboard (`src/components/game/pinboard/`)
- [ ] ★ Corkboard surface view rendered upon completing Section 5.
- [ ] ★ Drag-and-drop timeline builder powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
- [ ] ★ Keyboard accessibility and mobile touch support for clue card ordering.
- [ ] ★ Dynamic SVG red yarn lines connecting cards in placed sequence.
- [ ] ★ Respect `prefers-reduced-motion` settings.

### Pinboard Validation & Case Resolution (`src/server/services/pinboard-service.ts`)
- [ ] ★ Transactional pinboard submission service:
  1. Record submission and clue card positions in `pinboard_submissions` and `pinboard_placements`.
  2. Validate placed positions against `clues.chronological_order`.
  3. If correct: calculate finale score bonuses, compute `total_time_seconds`, mark session `COMPLETED`.
  4. If incorrect: enforce retry cooldown and record placement penalty.
- [ ] ★ Case Solved Verdict Screen:
  - [ ] Case summary debrief, accuracy breakdown, squad contributions, and final rank badge.

---

## Phase M5: Leaderboards, Multiplayer Sync & Production Hardening

### Leaderboard System (`src/app/(game)/leaderboard/page.tsx`)
- [ ] ★ Individual and Team leaderboard queries over `COMPLETED` sessions.
- [ ] ★ Ranked by highest score first, then fastest completion time.
- [ ] ★ Filterable by case and time period.

### Multiplayer Team Progress Polling
- [ ] ★ Lightweight polling hook (`src/components/game/use-team-sync.ts`) refreshing session status every 5 seconds while team tab is focused.
- [ ] ★ Synchronize newly unlocked clues and solved question states across teammates.

### Production Hardening & Accessibility Pass
- [ ] ★ Security headers in Next.js config (CSP, HSTS, X-Frame-Options, Permissions-Policy).
- [ ] ★ WCAG AA accessibility audit (contrast ratios on dark palettes, keyboard traversal, aria-live announcements).
- [ ] ★ Image optimization pass (WebP formats, responsive picture elements, blur placeholders).
- [ ] ★ Neon production database connection pooling verification.
- [ ] ★ End-to-end smoke test verifying clean run through complete Case 01 investigation.

---

## Future Roadmap & Post-v1 Extensions
- [ ] Push-based WebSocket / SSE realtime synchronization for squads.
- [ ] Cloudflare R2 / S3 storage for dynamic case pack downloads.
- [ ] Procedural voice generation for wiretap audio files.
- [ ] Custom community case builder & authoring portal.
- [ ] Native mobile wrapper / PWA enhancements.

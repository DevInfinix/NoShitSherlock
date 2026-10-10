# AGENTS.md — NoShitSherlock

Context file for AI coding agents (Kilo Code, Antigravity, others). Read it fully before writing code. If a task conflicts with this file or is not covered by it, open an issue and ask instead of guessing.

---

## 1. Project

NoShitSherlock is an open-source detective web game. A player, or a team, opens a case "folder", plays 5 sections of mixed puzzles (fill-in-the-blank, MCQ, true/false, cryptic, voicemail transcript), collects clues into a notebook, then arranges the clues in chronological order on a pinboard to solve the case. Progress, scores, hints and leaderboards are stored server-side, so a player can continue on any device.

- Repository: github.com/DevInfinix/noshitsherlock
- Production: a subdomain of thesamstudios.in
- Quality bar: production-ready, clean, professional. It must not look auto-generated (see §10).
- Not in scope for v1: AI case-generation pipeline, magic-link login, payments, admin dashboard, push-based realtime, mobile apps, i18n.

---

## 2. Rules for agents

1. The database is the source of truth. Client state is cosmetic only and never decides scores, answers or progress.
2. Correct answers never reach the client. Never send `correct_answer` or `is_correct` of options to the browser.
3. Every game action that changes state runs inside one database transaction (§6).
4. Schema changes only through migration files. Never edit a migration that has been applied.
5. Use only the dependencies listed in §3. Need another one? Open an issue first.
6. Check the official docs (§13) before using a library API. Do not rely on memory; these libraries change quickly.
7. No secrets in the repo or in client code. Only `NEXT_PUBLIC_*` variables reach the browser.
8. TypeScript strict. No `any`, no `@ts-ignore`.
9. Comments: short, informal, only where the reason behind the code is not obvious. Do not restate what the code does.
10. Run `bun run check` before every commit. Never commit failing code.
11. Follow the git rules in §10. One issue per task, small commits.
12. Do not invent game rules. Anything undefined goes into §8 "Open questions" or an issue.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Package manager, scripts, tests | Bun |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, lucide-react |
| Animation | `motion` (application transitions), `gsap` + `@gsap/react` + ScrollTrigger (landing scroll), `lenis` (landing smooth scroll); optional `three`, `@react-three/fiber`, `@react-three/drei` for a dynamically loaded decorative landing canvas |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Client state | Zustand (UI only: open folder, current page, notebook panel) |
| Validation | Zod (inputs, env vars, `case.json`) |
| Database | PostgreSQL 17 (Neon in production, Docker locally) |
| ORM and driver | Drizzle ORM, drizzle-kit, `pg` |
| Auth | Better Auth (email/password, Google, GitHub) |
| Email | Resend (verification and password reset only) |
| Lint and format | Biome |
| Tests | `bun test` against a real Postgres |
| Git hygiene | Husky, lint-staged, commitlint (Conventional Commits) |
| CI | GitHub Actions, Dependabot |

Data fetching uses Server Components and Server Actions. There is no client-side data-fetching library.

---

## 4. Run, build, deploy

**Platforms:** Windows, macOS and Linux. Everything runs through `bun run`. No bash-only commands in `package.json`; use cross-platform tools.

**Local (Bun):** install Bun, then `bun install`, copy `.env.example` to `.env.local`, `docker compose up db -d`, `bun run db:migrate`, `bun run db:seed`, `bun run dev`.

**Local (full Docker):** `docker compose up --build` starts Postgres, runs migrations, then starts the app. The Dockerfile is multi-stage (build with the Bun image, run on a slim Node image with Next.js standalone output, non-root user, healthcheck on `/api/health`) and must build for linux/amd64 and linux/arm64.

**Scripts (names fixed):** `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `test`, `check` (lint + typecheck + test), `db:generate`, `db:migrate`, `db:seed`, `db:studio`.

**Production:** Vercel on the subdomain, Neon Postgres. Any Docker host also works. Keep business logic free of Vercel-only APIs. If paid features launch, the app must move off Vercel's free Hobby plan (non-commercial only).

**Environment variables** (keep `.env.example` in sync, validate with Zod at startup): `DATABASE_URL` (pooled, runtime), `DATABASE_URL_UNPOOLED` (direct, migrations only; same value locally), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.

**Next.js 16 reminders:** `proxy.ts` replaces `middleware.ts`. `params`, `searchParams`, `headers()` and `cookies()` are async and must be awaited. Do not query the database from Client Components. The game folder and pinboard are Client Components; their data is loaded by parent Server Components.

---

## 5. Repository structure

Every name in this tree is a real file or folder to create. Nothing else.

```
noshitsherlock/
├── AGENTS.md
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── Dockerfile
├── docker-compose.yml
├── drizzle.config.ts
├── .env.example
├── .github/
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── content/cases/<case-slug>/case.json
├── public/cases/<case-slug>/
├── drizzle/
├── src/
│   ├── proxy.ts
│   ├── app/
│   ├── components/
│   ├── db/
│   ├── server/
│   ├── store/
│   └── lib/
└── tests/
```

| Folder | Purpose |
|---|---|
| `content/cases/<case-slug>/case.json` | A whole case (sections, questions, options, clues, hints, assets). Validated by Zod, loaded by `bun run db:seed`. Seeding is safe to run repeatedly. |
| `public/cases/<case-slug>/` | The case's image and audio files. |
| `drizzle/` | Generated SQL migrations. Committed. |
| `src/app/` | Routes. Groups: `(public)` landing/login/signup, `(game)` library, case, pinboard, leaderboard, teams. `api/` contains only the Better Auth handler and `health`. |
| `src/components/` | `ui/` (shadcn), `game/` (folder, questions, notebook, pinboard), plus small shared components. |
| `src/db/` | `schema/` (one file per area: auth, teams, content, runtime), `client.ts` (one pool), `seed.ts`. |
| `src/server/` | `actions/` (thin Server Actions), `services/` (business logic), Better Auth config. |
| `src/store/` | Zustand stores. |
| `src/lib/` | env validation, Zod schemas, helpers. |
| `tests/` | Service and database tests. |

---

## 6. Architecture rules

- Request path: Server Action → check logged-in user → check the user may touch this session → validate input with Zod → service function → return a safe result.
- Actions stay thin. All logic lives in `src/server/services/`, written as plain functions that are easy to test.
- A user may act on a session only if they own it or belong to the owning team. Enforce this in the service.
- **Answer submission, one transaction:**
  1. Create the question-state row if missing, then lock it (`SELECT … FOR UPDATE`).
  2. Reject if the question is already solved, attempts are used up, or the attempt comes too soon after the previous one.
  3. Insert the attempt into `session_answers`.
  4. Update the state: attempts +1; `is_solved` can only turn true, never back to false; set `solved_at` once.
  5. On the first correct solve: add the question's points to `game_sessions.score` and unlock the linked clues (ignore duplicates).
  6. On a wrong answer: increment `wrong_attempts` and apply the penalty (score never below 0).
- Score is written only in this service, never from the client and never from another place.
- Pinboard submission follows the same pattern in one transaction: store the submission and placements, compare against `clues.chronological_order`, update score and session status.
- Two teammates answering the same question at the same time must produce exactly one solve and one score award.
- Spam protection in v1 = `max_attempts` + a minimum interval between attempts (from `last_attempt_at`) + the pinboard retry delay. No extra tables or Redis.
- Domain errors are typed in services and shown as friendly messages by actions. Never leak SQL errors.

---

## 7. Database

Naming: snake_case, plural tables. Game tables use `BIGINT GENERATED ALWAYS AS IDENTITY`; Better Auth tables keep their text ids. Use NOT NULL, CHECK, UNIQUE and foreign keys everywhere they apply. JSONB only for non-queried config. No triggers, no views, no raw SQL migrations in v1; Drizzle migrations only.

**Auth (generated by Better Auth, never hand-edited):** `user`, `session`, `account`, `verification`.

**Teams**
- `teams` — id, name, join_code (unique, random 8 characters), owner_id → user, created_at
- `team_members` — team_id, user_id, role (`owner` or `member`), joined_at; PK (team_id, user_id)

**Content (authored, read-mostly)**
- `cases` — id, slug (unique), title, description, difficulty (1–5), max_score, is_active, created_at
- `assets` — id, case_id, asset_key, asset_type (`IMAGE`, `AUDIO`, `PDF`, `DOCUMENT`), url, mime_type, alt_text; unique (case_id, asset_key)
- `sections` — id, case_id, section_order (>0), title, narrative, folder_page_asset_id, time_limit_seconds (nullable); unique (case_id, section_order)
- `questions` — id, section_id, question_key, question_type (`FILL_DASHES`, `MCQ`, `TRUE_FALSE`, `CRYPTIC`, `VOICEMAIL_TRANSCRIPT`), prompt, placeholder_text, correct_answer, points (>=0), max_attempts (>0, default 5), penalty_per_wrong (>=0), sort_order, metadata (JSONB, accepted-answer variants and UI hints); unique (section_id, question_key). MCQ has NULL `correct_answer`; every other type requires it. TRUE_FALSE stores `true` or `false`.
- `question_options` — id, question_id, option_text, is_correct, sort_order; unique (question_id, sort_order); partial unique index so only one option per question is correct
- `question_assets` — question_id, asset_id, usage_type; PK (question_id, asset_id)
- `clues` — id, case_id, clue_key, title, clue_text, chronological_order (>0), metadata (JSONB, pinboard look); unique (case_id, clue_key), unique (case_id, chronological_order)
- `clue_assets` — clue_id, asset_id; PK both
- `question_clues` — question_id, clue_id; PK both (which question unlocks which clue)
- `hints` — id, question_id, hint_text, cost_points (>=0), hint_order; unique (question_id, hint_order)

**Runtime (one play-through)**
- `game_sessions` — id, case_id, user_id (nullable), team_id (nullable), status (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`), current_section_id, score (>=0), hint_balance (>=0), wrong_attempts (>=0), started_at, completed_at, total_time_seconds (>=0). Exactly one of user_id / team_id is set. At most one `IN_PROGRESS` session per user per case and per team per case.
- `session_question_states` — session_id, question_id, attempts_used, is_solved, last_attempt_at, solved_at; PK (session_id, question_id)
- `session_answers` — id, session_id, question_id, answered_by_user_id, submitted_answer, is_correct, time_taken_ms, hint_used, created_at
- `session_clues` — session_id, clue_id, source_question_id, unlocked_at; PK (session_id, clue_id)
- `hint_requests` — id, session_id, hint_id, cost_points, created_at; unique (session_id, hint_id)
- `pinboard_submissions` — id, session_id, is_correct, score_awarded, penalty_applied, submitted_at
- `pinboard_placements` — id, submission_id, clue_id, placed_position (>0), is_correct_position; unique (submission_id, clue_id), unique (submission_id, placed_position)

**Delete rules:** content children cascade from their case; runtime children cascade from their session; `game_sessions.case_id` is RESTRICT. Retire a case with `is_active = false`, never delete it once played.

**Indexes:** every foreign key used in joins, plus `game_sessions (user_id, case_id)`, `game_sessions (team_id, case_id)`, `session_answers (session_id, question_id)`, and `game_sessions (case_id, status, score, total_time_seconds)` for the leaderboard.

**Leaderboard:** a normal query over `COMPLETED` sessions, best score first, then fastest time. Two lists: individual and team.

---

## 8. Game flow and open questions

**Baseline flow (implement exactly this until the section below is extended):**
1. Landing page → login or signup.
2. Library shows the active cases. A case with an `IN_PROGRESS` session shows "Continue".
3. Start creates a `game_sessions` row (solo or team); Continue loads it.
4. Sections 1–5: each section is a page of questions. Answers are checked on the server.
5. A correct answer unlocks its clues into the notebook.
6. After section 5 the folder closes and becomes the pinboard.
7. The player orders the unlocked clues; the server validates against `chronological_order`.
8. A correct order marks the session `COMPLETED`, stores time and score, shows the case-solved screen and updates the leaderboard.

**Teams and multiplayer (v1):**
- A user creates a team and gets a join code; others join with the code. Members share one team session and see the same progress.
- Each attempt stores who answered, for per-member stats.
- Shared progress stays in sync by refreshing the session data every few seconds while a team session is open and the tab is visible. Push-based realtime is future work; keep refresh logic in one small hook so it can be swapped.

**Open questions (to be answered in the detailed flow; do not guess):**
1. How points, `hint_balance` and penalties interact; whether score can drop to zero.
2. What happens when a question runs out of attempts.
3. Whether section time limits are enforced.
4. Pinboard scoring, retry delay and penalty.
5. Whether guests can play without an account.
6. Team size limit, leaving a team mid-session, who can start a team session.
7. Leaderboard tie-breaks and whether only the best session counts.

*The detailed game flow will be added here as a new subsection.*

---

## 9. UI and assets

- Components come from shadcn/ui and are customized, not left default. Visual direction: noir detective. Dark interface, worn paper folder, typewriter and handwriting fonts loaded with `next/font`, pinboard with yarn. Final brand details will be supplied.
- Page turn, folder open/close and the folder-to-pinboard morph are built with `motion`.
- Pinboard must work with keyboard and touch, not only mouse. Respect `prefers-reduced-motion`.
- Responsive from phone to desktop. Every image has alt text. Audio questions always show a transcript option.
- **Assets are AI-generated, offline, before commit** (never at runtime). Store optimized files (WebP for images, MP3 for audio) in `public/cases/<case-slug>/`. Each asset entry in `case.json` records its alt text, the tool used and the prompt, so provenance is traceable. No real people, no copyrighted characters or logos. The README states that artwork and audio are AI-generated.

---

## 10. Git and quality

**Workflow**
- `main` is protected and always deployable. Changes arrive through pull requests with passing CI.
- Create an issue first (template, labels, milestone). Branch name: `type/<issue-number>-short-slug`, e.g. `feat/12-answer-transaction`.
- Commits: small and atomic, one logical change each, Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`), imperative subject under 72 characters, body when the reason is not obvious. Enforced by commitlint.
- Never create filler, empty or artificially split commits. History must reflect real work.
- Every PR links its issue (`Closes #n`), explains what and why, lists how it was tested, and includes screenshots for UI changes. Merge with a normal merge commit to keep history.
- Use the `gh` CLI for issues, PRs and merges when authenticated. Tag releases with semver and write GitHub release notes.

**CI** (every PR): install with a frozen lockfile, Biome check, typecheck, tests against a Postgres service container with migrations applied from scratch, build.

**Tests** (priority order): answer transaction including concurrent submission; pinboard validation; access control (a non-member cannot touch a session); `case.json` schema; seed runs twice without duplicates.

**Looks-professional checklist:** consistent naming; small focused files; no dead code, commented-out code, stray `console.log` or TODO without an issue; no leftover boilerplate text; typed errors; loading, empty and error states on every page; accessible forms; README with screenshots, feature list, quick start (Bun and Docker), tech stack and license; CI badge.

---

## 11. License

- Code: Apache-2.0 (`LICENSE`). Contributions are accepted under the same license (stated in `CONTRIBUTING.md`).
- Case content, artwork and audio are not under the code license: all rights reserved unless a case says otherwise. State this in the README so paid case packs stay possible.
- Reserve the project name and logo in the README.

---

## 12. Milestones

| Milestone | Scope |
|---|---|
| M0 Foundation | Scaffold, Biome, Husky/commitlint, CI, Dockerfile and compose, README/CONTRIBUTING/SECURITY/LICENSE, first deploy to the subdomain |
| M1 Database | Full schema, migrations, `case.json` schema and seed with at least one complete case, database tests |
| M2 Auth and teams | Email/password, Google, GitHub, email verification and reset, route protection, create/join team |
| M3 Gameplay | Library with Continue, folder UI with page turn, five question types, answer transaction, hints |
| M4 Finale | Notebook, clue unlock, pinboard, validation, case-solved screen |
| M5 Leaderboard and polish | Individual and team leaderboards, team refresh, error/empty states, security headers, accessibility pass |
| Future | Push-based realtime, caching layer, admin dashboard, R2 asset storage, AI case pipeline, paid features, end-to-end browser tests, published multi-arch Docker image |

---

## 13. Official docs

Next.js https://nextjs.org/docs · React https://react.dev · Bun https://bun.sh/docs · Better Auth https://www.better-auth.com/docs · Drizzle https://orm.drizzle.team/docs · Neon https://neon.com/docs/llms.txt · PostgreSQL https://www.postgresql.org/docs · Zod https://zod.dev · Tailwind https://tailwindcss.com/docs · shadcn/ui https://ui.shadcn.com · Motion https://motion.dev · dnd-kit https://dndkit.com · Zustand https://zustand.docs.pmnd.rs · Resend https://resend.com/docs · Biome https://biomejs.dev · Conventional Commits https://www.conventionalcommits.org

---

## 14. Product-brief index

The implementation-facing supplement is [hs.md](../NoShitSherlock/hs.md). Read it after this file for the product/design system, case-content pipeline, and implementation plan. This file remains authoritative when the documents differ.

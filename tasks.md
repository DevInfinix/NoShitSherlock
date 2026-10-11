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
- [x] ★ Configure `.github/FUNDING.yml` with Ko-fi (`ko_fi: DevInfinix`).
- [x] ★ Update security reporting email in `SECURITY.md` to `admin@thesamstudios.in`.
- [x] ★ Update outbound email sender address placeholder `EMAIL_FROM` in `.env.example` to `NoShitSherlock <auth@yourdomain.com>`.
- [x] ★ Create `tasks.md` and `progress.md` tracking frameworks.

---

## Phase M1: Database Architecture, Migrations & Content Pipeline

### Database Layer & Schemas (`src/db/schema/`)
- [x] ★ Database Client & Pool Setup (`src/db/client.ts`):
  - [x] Configure `pg` connection pool with SSL support for Neon Postgres in production.
  - [x] Configure direct unpooled connection for `drizzle-kit` migrations.
  - [x] Wrap Drizzle client with singleton instance pattern for development hot-reloading.
- [x] ★ Auth Schema (`src/db/schema/auth.ts`):
  - [x] `user` table (id, name, email, emailVerified, image, createdAt, updatedAt).
  - [x] `session` table (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId).
  - [x] `account` table (id, accountId, providerId, userId, accessToken, refreshToken, expiresAt, password).
  - [x] `verification` table (id, identifier, value, expiresAt, createdAt, updatedAt).
- [x] ★ Teams Schema (`src/db/schema/teams.ts`):
  - [x] `teams` table (BIGINT IDENTITY PK, name, join_code 8-char random alphanumeric unique, owner_id FK to user, created_at).
  - [x] `team_members` table (team_id FK, user_id FK, role ENUM `owner` | `member`, joined_at; composite PK `team_id, user_id`).
- [x] ★ Content Schema (`src/db/schema/content.ts`):
  - [x] `cases` table (id IDENTITY, slug UNIQUE, title, description, difficulty 1-5, max_score, is_active, created_at).
  - [x] `assets` table (id IDENTITY, case_id FK, asset_key, asset_type ENUM `IMAGE`|`AUDIO`|`PDF`|`DOCUMENT`, url, mime_type, alt_text; UNIQUE `case_id, asset_key`).
  - [x] `sections` table (id IDENTITY, case_id FK, section_order > 0, title, narrative, folder_page_asset_id, time_limit_seconds; UNIQUE `case_id, section_order`).
  - [x] `questions` table (id IDENTITY, section_id FK, question_key, question_type ENUM `FILL_DASHES`|`MCQ`|`TRUE_FALSE`|`CRYPTIC`|`VOICEMAIL_TRANSCRIPT`, prompt, placeholder_text, correct_answer [NULL for MCQ], points >= 0, max_attempts default 5, penalty_per_wrong >= 0, sort_order, metadata JSONB; UNIQUE `section_id, question_key`).
  - [x] `question_options` table (id IDENTITY, question_id FK, option_text, is_correct, sort_order; UNIQUE `question_id, sort_order`; partial unique index enforcing max 1 correct option per question).
  - [x] `question_assets` table (question_id FK, asset_id FK, usage_type; composite PK `question_id, asset_id`).
  - [x] `clues` table (id IDENTITY, case_id FK, clue_key, title, clue_text, chronological_order > 0, metadata JSONB; UNIQUE `case_id, clue_key`, UNIQUE `case_id, chronological_order`).
  - [x] `clue_assets` table (clue_id FK, asset_id FK; composite PK `clue_id, asset_id`).
  - [x] `question_clues` table (question_id FK, clue_id FK; composite PK `question_id, clue_id`).
  - [x] `hints` table (id IDENTITY, question_id FK, hint_text, cost_points >= 0, hint_order; UNIQUE `question_id, hint_order`).
- [x] ★ Runtime Progress Schema (`src/db/schema/runtime.ts`):
  - [x] `game_sessions` table (id IDENTITY, case_id FK, user_id FK nullable, team_id FK nullable, status ENUM `IN_PROGRESS`|`COMPLETED`|`ABANDONED`, current_section_id, score >= 0, hint_balance >= 0, wrong_attempts >= 0, started_at, completed_at, total_time_seconds >= 0; CHECK exactly one of user_id/team_id set; partial unique indexes for max 1 `IN_PROGRESS` per user/case and team/case).
  - [x] `session_question_states` table (session_id FK, question_id FK, attempts_used, is_solved, last_attempt_at, solved_at; composite PK `session_id, question_id`).
  - [x] `session_answers` table (id IDENTITY, session_id FK, question_id FK, answered_by_user_id FK, submitted_answer, is_correct, time_taken_ms, hint_used, created_at).
  - [x] `session_clues` table (session_id FK, clue_id FK, source_question_id FK, unlocked_at; composite PK `session_id, clue_id`).
  - [x] `hint_requests` table (id IDENTITY, session_id FK, hint_id FK, cost_points, created_at; UNIQUE `session_id, hint_id`).
  - [x] `pinboard_submissions` table (id IDENTITY, session_id FK, is_correct, score_awarded, penalty_applied, submitted_at).
  - [x] `pinboard_placements` table (id IDENTITY, submission_id FK, clue_id FK, placed_position > 0, is_correct_position; UNIQUE `submission_id, clue_id`, UNIQUE `submission_id, placed_position`).
- [x] ★ Legal & Compliance Schema (`src/db/schema/legal.ts`):
  - [x] `legal_acceptances` table (id IDENTITY, user_id FK, document_version, is_over_13 BOOLEAN, terms_accepted_at, privacy_accepted_at, marketing_opt_in BOOLEAN).

### Migration Pipeline & Seed Automation
- [x] ★ Drizzle Migration Generation:
  - [x] Run `bun run db:generate` to produce initial SQL migration under `drizzle/` (`0000_steep_lenny_balinger.sql`).
- [x] ★ Zod Case Specification Validator (`src/lib/case-schema.ts`):
  - [x] Validate complete structure of `content/cases/<case-slug>/case.json` (sections, questions, options, clues, hints, asset keys).
  - [x] Validate question rules: MCQ must have NULL `correct_answer` and matching options; other types require explicit `correct_answer`.
  - [x] Validate clue chronological ordering uniqueness.
  - [x] Automated unit test suite `tests/case-schema.test.ts`.
- [x] ★ Migration Execution & Idempotent Seeding:
  - [x] Provisioned Neon PostgreSQL 17 project (`noshitsherlock` in TheSamStudios org).
  - [x] Configured Neon credentials in git-ignored `.env.local`.
  - [x] Executed `bun run db:migrate` applying all 24 tables to Neon PostgreSQL 17.
- [x] ★ Automated Case Seeder (`src/db/seed.ts`):
  - [x] Parse `content/cases/` folders and load `case.json`.
  - [x] Ensure idempotent execution (runs multiple times without duplicating data or breaking foreign keys).
  - [x] Implement Case 01 content seed from authored dossiers (`content/cases/case-01-missing-ledger/case.json`).
  - [x] Successfully verified seed execution against live Neon database.
- [x] ★ Database Integration Tests (`tests/db.test.ts`):
  - [x] Verify live database queries against Case 01 (5 sections, clues, questions).
  - [x] Test idempotent seed execution.

---

## Phase M2: Authentication, Authorization & Team Management

### Better Auth Integration
- [x] ★ Configure Better Auth server (`src/server/auth.ts`) with Drizzle adapter.
- [x] ★ Set up authentication methods:
  - [x] Email passwordless / password login with 10-minute expiry verification via Resend.
  - [x] Social OAuth provider stubs: Google, GitHub, and Discord.
- [x] ★ Implement 10-minute expiry, single-use email verification flow.
- [x] ★ Implement Age Gate & Legal Consent Flow:
  - [x] Pre-registration screen logic requiring confirmation of age (13+) and acceptance of Terms of Service & Privacy Policy.
  - [x] Store immutable acceptance records in `legal_acceptances`.

### Route Protection & Session Guard
- [x] ★ Configure `src/proxy.ts` (Next.js 16 route proxy) to guard `(game)` routes against unauthenticated requests.
- [x] ★ Implement session helper utilities (`src/server/session.ts`) to resolve current user and active session.

### Team Management Services (`src/server/services/team-service.ts`)
- [x] ★ Create team with cryptographic 8-character uppercase join code.
- [x] ★ Join team with code validation and capacity checks (max 8 detectives).
- [x] ★ List team members and show active rosters with user identities.
- [x] ★ Transfer ownership and leave team logic (with auto-disband when sole member leaves).
- [x] ★ Server Actions for team UI: `createTeamAction`, `joinTeamAction`, `leaveTeamAction`, `getMyTeamsAction`, `getTeamRosterAction`.
- [x] ★ Unit & integration tests for team authorization and legal consent rules (`tests/teams.test.ts`).

### Interactive Detective Auth & Onboarding Revamp (Issue #5, #7, #9, #11, #13, #15)
- [x] ★ Install and configure `@react-three/fiber`, `@react-three/drei`, `three`, and `@types/three`.
- [x] ★ Integrate licensed detective fonts (TBJ Valmist, Charlea Demo, Gothica Modern, Harmera, ITC Garamond, Selnora, plus Google Caveat & Special Elite) with CSS font variables in `src/app/fonts.ts` and Tailwind `@theme`.
- [x] ★ Database Schema Migration: added `agent_tag` (3-digit unique), `username` (unique), and `training_completed` (boolean) to `users` table via Drizzle migration `0001_mighty_thing.sql`.
- [x] ★ 3D Interactive Detective Warrant Card (`src/components/auth/DetectiveIDCard3D.tsx`):
  - [x] Restored realistic React Three Fiber (R3F) 3D badge with physical clearcoat shaders (`meshPhysicalMaterial`), laminated reflections, and golden rim lighting from the left (`directionalLight position={[-5, 0, 3.5]} color="#e5b85c"`).
  - [x] Restored vibrant multi-stop provider hover gradient washes (sapphire blue for Google, imperial purple for GitHub, deep oxblood for Email).
  - [x] Increased physical card dimensions (`2.75 x 3.86`) and framed camera frustum (`fov: 42`, `z: 6.2`) with generous margins to permanently eliminate boundary clipping.
  - [x] Smooth, lenient pointer and touch tilt tracking with zero jitter or wobble.
  - [x] Permanent hardware anchoring: brass swivel clip and D-ring directly mounted to card slot.
  - [x] Tap or click to flip 180° revealing magnetic stripe, microchip, and handwritten signature.
  - [x] Default initial unauthenticated badge tag to "AGENT ???" across both login and signup.
  - [x] Project-authentic branding: "No Shit Sherlock: Department of Unresolved Investigations".
  - [x] Real-time live synchronization as operative types email, callsign, and agent tag.
  - [x] Configured `allowedDevOrigins` in `next.config.ts` to allow cross-origin LAN mobile device development testing (`192.168.1.34`).
- [x] ★ Minimalist Noir Detective Sign In (`src/components/auth/LoginForm.tsx`):
  - [x] Viewport coverage scaled to 85-90% with full mobile touch responsiveness and scroll freedom.
  - [x] Dominant left typography in TBJ Valmist with clean copy and intuitive `SIGN IN` / `SIGN UP` mode switcher.
  - [x] Dynamic vertical accordion with prominent hover expansion and smooth in-place input collapse/reveal.
  - [x] In-place email and password disclosure with large stylized inputs.
  - [x] Full-page slide-in "Welcome back, Agent [tag]" animation with alternating left/right trajectory.
- [x] ★ Multi-Step Detective Registration & Onboarding (`src/components/auth/SignupForm.tsx`):
  - [x] Matching 85-90% viewport layout with responsive columns and persistent 3D R3F card.
  - [x] Live email synchronization onto the badge during registration.
  - [x] 3-digit numerical Agent Tag selection with real-time uniqueness validation and live card sync.
  - [x] Callsign / username assignment with live ID card signature engraving.
  - [x] "Welcome, Agent [tag]" dramatic entrance.
  - [x] Aged parchment legal document with Department of Unresolved Investigations Directives, age 13+ compliance, and interactive "Complete Training" rubber stamp.

---

## Phase M3: Gameplay Loop & Dossier Engine

### Case Library & Session Initialization
- [x] ★ Case Library Screen `src/app/(game)/cases/page.tsx`:
  - [x] Display available active cold cases with difficulty ratings and briefing summaries.
  - [x] Detect in-progress sessions and render prominent "Continue Investigation" state.
- [x] ★ Session Start / Resume Service (`src/server/services/game-session-service.ts`):
  - [x] Atomic creation of `game_sessions` row for individual player or squad.
  - [x] Resume existing `IN_PROGRESS` session with current section position and score.

### Tactical Noir Dossier UI (`src/components/game/folder/`)
- [x] ★ Physical Dossier Layout:
  - [x] Manila evidence folder container with paper texture shaders.
  - [x] Section navigation tabs with typewriter headers and stamp badges.
  - [x] Smooth page-turn transitions using Motion (`motion/react`).
- [x] ★ 5 Progressive Puzzle Component Formats:
  - [x] `FillDashesQuestion.tsx`: interactive letter dash inputs with keyboard navigation.
  - [x] `McqQuestion.tsx`: evidence deduction selector with clean typographic indicators.
  - [x] `TrueFalseQuestion.tsx`: witness testimony assertion switches.
  - [x] `CrypticQuestion.tsx`: cipher text viewer with scratchpad note inputs.
  - [x] `VoicemailQuestion.tsx`: retro audio cassette/wiretap player with synced transcript reveal.

### Server-Authoritative Answer Submission Engine (`src/server/services/gameplay-service.ts`)
- [x] ★ Implement single-transaction submission logic:
  1. Acquire row lock on `session_question_states` via `SELECT ... FOR UPDATE`.
  2. Reject if already solved, max attempts exceeded, or submission interval too short (anti-spam).
  3. Insert attempt record into `session_answers` with user ID attribution.
  4. Update question state: increment `attempts_used`, update `last_attempt_at`.
  5. On correct answer: mark `is_solved = true`, record `solved_at`, add points to `game_sessions.score`, unlock associated clues into `session_clues`.
  6. On incorrect answer: increment `wrong_attempts`, deduct penalty points (clamped to 0 minimum).
- [x] ★ Hint System (`src/server/services/hint-service.ts`):
  - [x] Deduct hint penalty cost from session score.
  - [x] Record unlock in `hint_requests` and reveal hint text.
- [x] ★ Concurrency testing: verify two simultaneous team submissions produce exactly one solve award (`tests/gameplay.test.ts`).

---

## Phase M4: Detective Notebook & Chronological Pinboard

### Detective Notebook Drawer (`src/components/game/notebook/`)
- [x] ★ Slide-out leather/cloth field notebook panel.
- [x] ★ Filter unlocked clues by suspect, crime scene, forensics, or timeline tag.
- [x] ★ Detailed clue inspection modal showing high-res evidence image, transcript quote, and timestamp note.
- [x] ★ Zustand notebook state store (`src/store/notebook-store.ts`) for UI opening/closing state.

### Chronological Evidence Pinboard (`src/components/game/pinboard/`)
- [x] ★ Corkboard surface view rendered upon completing Section 5.
- [x] ★ Drag-and-drop timeline builder powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
- [x] ★ Keyboard accessibility and mobile touch support for clue card ordering.
- [x] ★ Dynamic SVG red yarn lines connecting cards in placed sequence.
- [x] ★ Respect `prefers-reduced-motion` settings.

### Pinboard Validation & Case Resolution (`src/server/services/pinboard-service.ts`)
- [x] ★ Transactional pinboard submission service:
  1. Record submission and clue card positions in `pinboard_submissions` and `pinboard_placements`.
  2. Validate placed positions against `clues.chronological_order`.
  3. If correct: calculate finale score bonuses, compute `total_time_seconds`, mark session `COMPLETED`.
  4. If incorrect: enforce retry cooldown and record placement penalty.
- [x] ★ Case Solved Verdict Screen (`src/components/game/pinboard/CaseSolvedScreen.tsx`):
  - [x] Case summary debrief, accuracy breakdown, clearance rank commendation, and elapsed time tracking.
- [x] ★ Pinboard integration test suite in `tests/pinboard.test.ts`.

---

## Phase M4.5: Cinematic Landing Page & Noir Interaction Engine (Issue #17)

### Parallax Image Sequence & Canvas Frame Scrubbing
- [x] ★ Batch-converted 150 frames (`ezgif-frame-*.png`) into optimized WebP images (`public/landing/frames/frame-[001..150].webp`), reducing weight from 109.12 MB down to 6.41 MB (94.1% reduction).
- [x] ★ Implemented GSAP ScrollTrigger canvas frame-scrubbing engine with progressive 20-frame fast boot and background streaming.
- [x] ★ Integrated Lenis smooth scrolling with GSAP ticker synchronization and `prefers-reduced-motion` detection.

### Fluid Cursor & Visual Clearance HUD
- [x] ★ Implemented spring-physics spotlight flashlight cursor (`src/components/ui/spotlight-cursor.tsx`) with brass reticle and dynamic target scaling.
- [x] ★ Built vertical Scroll Progress HUD (`src/components/landing/ScrollProgressHud.tsx`) showing real-time 00%–100% progress and sector jumping.
- [x] ★ Built Noir Sound Engine (`src/lib/audio/sound-engine.ts`) with synthetic Web Audio SFX (typewriter, paper rustle, stamp impact, vinyl ambient loop).

### Component Suites (Motion-Primitives, Magic UI, Vengeance UI, Blobatar)
- [x] ★ Motion-Primitives: `TextScramble`, `TextShimmer`, `ProgressiveBlur`, `SpotlightCard`.
- [x] ★ Magic UI: `BorderBeam`, `Particles`, `PerspectiveMarquee`, `RadarRipple`.
- [x] ★ Vengeance UI: `BooksShowcase` (3D interactive dossier cards with mouse tilt and briefing drawer), `CylinderCarousel` (3D rotating evidence artifact carousel), `TextMorph`.
- [x] ★ Blobatar: `@blobatar/react` integration (`src/components/ui/blobatar-avatar.tsx`) wired into landing operative badges, signup agent tag/username selection, and login welcome screens.
- [x] ★ Classified 404 Easter Egg (`src/app/not-found.tsx`): interactive crime scene barrier tape, warehouse flashlight beam, corrupted telegraph decoder, and hidden evidence tag.
- [x] ★ Favicon Suite: integrated `favicon.ico`, standard PNG icons, Apple touch icons, and webmanifest in `public/` and `src/app/layout.tsx`.

### Landing Page Revisions & Impeccable Noir Overhaul
- [x] ★ Background-free minimalist navbar with `/favicon-32x32.png` logo, lowercase `noshitsherlock` branding in `fontGothica`, high-contrast `STAR ON GITHUB` button with live GitHub icon, subtle The Sam Studios credit (`by The Sam Studios` linking to `https://thesamstudios.in`), and dual "Login as Detective" / "Sign up as Detective" actions.
- [x] ★ Complete removal of all audio controls, sound triggers, and `AudioControlHud` from the landing page.
- [x] ★ Hidden default browser scrollbars globally across Chrome, Safari, Firefox, and Edge via `globals.css`.
- [x] ★ Oversized monumental hero branding: "NO" and "SHIT" in `TBJ Valmist ExtraBold` (`clamp(6.8rem, 15vw, 17rem)` in Warm Ivory), "Sherlock" in `Charlea Demo SemiBold Italic` (`clamp(7.8rem, 17vw, 19.5rem)` in Rich Crimson) with chromatic shadow depth, scaling down subtly by only ~15% on scroll.
- [x] ★ Canvas watermark protection & extended tactile scroll: lengthened hero track to `400vh`, applied intrinsic 1.16x zoom and upward offset in `drawFrame`, and calibrated GSAP timeline (`scale: 1.28` -> `scale: 1.14`) to permanently crop out bottom AI image watermarks.
- [x] ★ Dynamic cursor-following spotlight illumination & custom detective reticle: mouse coordinates dynamically steer the radial flashlight glow, while default OS cursor is hidden in favor of a focused spotlight beam and expanding crosshair reticle.
- [x] ★ Unboxed, organic editorial right-hand hero layout: liberated content from rigid bordered containers into an asymmetric, layered presentation featuring live detective telemetry, incident report markers, and smooth `motion` tab transitions.
- [x] ★ Interactive Vertical Detective Timeline Meter (`VerticalInvestigateTimeline.tsx`): tactile vertical rail with dynamic red thread scrubbing, tick marks, stage nodes (`01 ABOUT`, `02 CASES`, `03 SOURCE`), and scrub percentage readout.
- [x] ★ Procedural Three.js Volumetric Smoke/Cloud Separator (`NoirCloudSeparator.tsx`): restored and enhanced with 2D-only WebGL context pre-acquisition (`depth: false, stencil: false, antialias: false`) to permanently resolve `Initializing WebGL backbuffer failed` errors. Features interactive cursor-following smoke curl disturbance, glassy specular sheen highlights, and dual-layer CSS volumetric fog fallback.
- [x] ★ Floating Detective Scene Optimization (`FloatingDetectiveScene.tsx`): re-engineered with hardware-accelerated CSS 3D transforms (`translate3d` & `rotate`) and volumetric lighting cones, eliminating secondary WebGL context contention while delivering smooth mouse parallax.
- [x] ★ Complete purge of the term "dossier" across user-facing pages and components, replaced with "case", "case file", and "investigation".
- [x] ★ Prominent The Sam Studios studio archive redirect card in the footer linking to `https://thesamstudios.in`.
- [x] ★ Legal page overhaul (`src/app/(public)/legal/page.tsx`): removed parody Scotland Yard 1947 references, instituted professional 2026 Terms of Service & Privacy Policy clauses, and added "Return to Home" navigation.

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

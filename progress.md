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

## 2. Current State (Phase M4: Completed)

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
   - Implemented Team Management service in `src/server/services/team-service.ts`.
   - Implemented Legal & COPPA Age Gate service in `src/server/services/legal-service.ts`.
   - Built comprehensive test suite in `tests/teams.test.ts`.
5. **Phase M3 Gameplay Loop & Dossier Engine Fully Delivered**:
   - Implemented Game Session & Case Library service (`src/server/services/game-session-service.ts`).
   - Implemented Server-Authoritative Answer Submission Engine (`src/server/services/gameplay-service.ts`) operating in atomic PostgreSQL transactions with row-level locks, anti-spam intervals, and clue unlocking.
   - Implemented Hint System Service (`src/server/services/hint-service.ts`).
   - Authored Tactical Noir Dossier UI (`src/components/game/folder/`) with all 5 puzzle components.
   - Built comprehensive test suite in `tests/gameplay.test.ts`.
6. **Phase M4 Detective Notebook & Chronological Pinboard Fully Delivered**:
   - Implemented Zustand Notebook State Store (`src/store/notebook-store.ts`).
   - Built Detective Notebook Drawer (`src/components/game/notebook/NotebookDrawer.tsx`) with category filters (`suspect`, `crime_scene`, `forensics`, `timeline`) and `ClueInspectionModal.tsx`.
   - Implemented Server-Authoritative Pinboard Validation Service (`src/server/services/pinboard-service.ts`) evaluating chronological sequences in an atomic transaction, awarding finale bonuses (+500 pts), updating session status to `COMPLETED`, and preventing rapid reordering via cooldown protection.
   - Authored typed Server Actions (`src/server/actions/pinboard-actions.ts`).
   - Built Chronological Evidence Pinboard UI (`src/components/game/pinboard/`):
     - `PinboardCorkboard.tsx`: Corkboard surface with `@dnd-kit/core` & `@dnd-kit/sortable` timeline builder and real-time SVG red yarn connections.
     - `SortableClueCard.tsx`: Pushpin cards with full keyboard navigation and touch support.
     - `CaseSolvedScreen.tsx`: Case closed report with final score, elapsed time, and Scotland Yard clearance rank commendations.
     - `src/app/(game)/pinboard/[slug]/page.tsx`: Protected Server Component route.
   - Built Pinboard Integration test suite in `tests/pinboard.test.ts` (18/18 total test suite passing against live Neon database).
7. **Authentication & Detective Onboarding Shell Fully Delivered (PR #4)**:
   - Built Better Auth React client in `src/lib/auth-client.ts`.
   - Created Legal Consent server action in `src/server/actions/auth-actions.ts`.
   - Built Detective Warrant Card Login UI in `src/components/auth/LoginForm.tsx`.
   - Built Detective Enrollment Signup UI with 13+ COPPA age gate in `src/components/auth/SignupForm.tsx`.
   - Added Statutory Compliance page in `src/app/(public)/legal/page.tsx`.
   - Created public routes at `/login`, `/signup`, and `/legal`.
   - Shipped via GitHub Issue #3, branch `feat/3-auth-shell`, and merged Pull Request #4.
8. **Interactive 3D Detective Auth & Onboarding Revamp (Issue #5, #7, #9, #11, #13, #15)**:
   - Integrated full detective font catalog (TBJ Valmist, Charlea Demo, Gothica Modern, Harmera, ITC Garamond, Selnora, plus Google Caveat & Special Elite) with CSS variables in `src/app/fonts.ts` and Tailwind CSS v4 `@theme`.
   - Added `agent_tag` (3-digit unique), `username` (unique), and `training_completed` (boolean) to the `users` table via Drizzle migration `0001_mighty_thing.sql`.
   - Built realistic React Three Fiber (R3F) 3D badge (`src/components/auth/DetectiveIDCard3D.tsx`) with physical clearcoat shaders (`meshPhysicalMaterial`), laminated reflections, and golden rim lighting from the left (`directionalLight position={[-5, 0, 3.5]} color="#e5b85c"`).
   - Engineered vibrant multi-stop provider hover gradient washes (sapphire blue for Google, imperial purple for GitHub, deep oxblood for Email).
   - Increased physical card dimensions (`2.75 x 3.86`) and framed camera frustum (`fov: 42`, `z: 6.2`) with generous margins to permanently eliminate boundary clipping.
   - Refined mobile responsiveness and added `allowedDevOrigins` in `next.config.ts` to allow cross-origin LAN mobile device development testing (`192.168.1.34`).
   - Set unauthenticated initial badge tag to "AGENT ???" consistently across login and signup.
   - Scaled layout coverage to 85-90% of the viewport with oversized TBJ Valmist typography and an intuitive `SIGN IN` / `SIGN UP` switcher.
   - Replaced horizontal blocks with a vertical expanding/shrinking options stack with prominent hover contrast and in-place email/password input disclosures.
   - Fixed live email synchronization onto the 3D card during registration.
   - Preserved full multi-step registration flow: 3-digit tag, callsign engraving, welcome takeover, and parchment legal training document with rubber stamp certification.
9. **Phase M4.5 Cinematic Landing Page & Noir Interaction Engine (Issue #17)**:
   - Optimized 150 image frames from 109.12 MB down to 6.41 MB WebP (94.1% reduction) in `public/landing/frames/`.
   - Built hardware-accelerated GSAP ScrollTrigger canvas frame-scrubbing engine across pinned track with progressive loading.
   - Synchronized Lenis smooth scroll provider (`SmoothScrollProvider.tsx`) with GSAP ticker.
   - Implemented zero-latency procedural Noir Sound Engine (`src/lib/audio/sound-engine.ts`) with typewriter, paper rustle, rubber stamp impact, and ambient room tone loop alongside `AudioControlHud.tsx`.
   - Integrated `@blobatar/react` (`BlobatarAvatar.tsx`) into signup agent tag/username step, and login welcome screens.
   - Built classified 404 easter egg page (`src/app/not-found.tsx` & `NotFoundView.tsx`) with crime scene tape, flashlight investigation cone, corrupted cipher decoder, and interactive evidence tag.
   - Relocated favicon assets into `public/` and configured metadata in `src/app/layout.tsx`.
10. **Cinematic Landing Page Complete Redesign (PR #18 update)**:
    - Delivered full-viewport cinematic noir experience with unified GSAP ScrollTrigger choreography.
    - Master title treatment: "NO" and "SHIT" in heavy `TBJ Valmist` ExtraBold, "Sherlock" in substantial `Charlea Demo` SemiBold Italic with negative tracking. Title smoothly scales down from massive initial viewport presence into an anchored brand mark in top-left.
    - Detective canvas: initial enlarged framing (`scale: 1.18`, `x: +7vw`), smoothly centering and scaling down (`scale: 1.0`, `x: 0vw`) as 150 frames scrub to lift magnifying glass towards viewer.
    - Purged all artificial clutter, dummy departments, fake timelines, and carousels.
11. **Landing Page Repair, Full Content Restoration & Color Calibration**:
    - Restored full visual hierarchy across three distinct desktop zones: Left (Oversized title), Center (Detective with layered burgundy/crimson ambient backlight), and Right (Legible, well-spaced game briefing with prominent action buttons).
    - Fixed palette and color contrast: Near-black charcoal (`#100D0D`), deep burgundy (`#260D10`), rich crimson red (`#A7192D`), bright crimson accent (`#C52A3B`), warm ivory (`#E8DCC8`), muted warm gray (`#A69A8C`), antique bronze (`#79604A`).
    - Fixed title contrasting colors: "NO" and "SHIT" in warm ivory (`#E8DCC8`); "Sherlock" in rich crimson red (`#A7192D`).
    - Restored prominent, visible fixed top navbar with brand mark, active navigation links (Cases, Investigation, Dossier 01, Directives), audio toggle HUD, and auth action buttons ("Register as detective", "Log as detective").
    - Removed `cursor-none`, restoring standard OS mouse pointer functionality while keeping the ambient spotlight beam following fluidly in the background.
    - Restored subsequent full sections below the hero: Section 2 (Investigation Mechanics: Evidence Folder, Notebook, Yarn Pinboard), Section 3 (Case Dossier Archives: The Blackwood Protocol), Section 4 (Enlistment Clearance), Section 5 (Complete Noir Footer).
    - Verified with `bun run check` (0 lint errors, 0 type errors, 18/18 tests pass) and successful Next.js 16 production build.
12. **Landing Page Minimalist & Impeccable Overhaul**:
    - Redesigned top navbar: high-contrast minimal glass styling (`bg-[#100D0D]/60 backdrop-blur-md`), directory favicon (`/favicon-32x32.png`), lowercase `noshitsherlock` in `fontGothica`, bold `STAR ON GITHUB` button with live GitHub icon, discreet The Sam Studios credit (`by The Sam Studios` linking to `https://thesamstudios.in`), and dual non-solid "Login as Detective" and "Sign up as Detective" actions.
    - Globally removed default browser scrollbars across WebKit, Firefox, and IE/Edge via `globals.css` rules.
    - Completely removed all audio controls, sound effects, and `AudioControlHud` from the landing page.
    - Upgraded hero branding scale: "NO" and "SHIT" in massive `TBJ Valmist ExtraBold` (`clamp(6.8rem, 15vw, 17rem)`), "Sherlock" in `Charlea Demo SemiBold Italic` (`clamp(7.8rem, 17vw, 19.5rem)`), with chromatic drop shadow depth.
    - Watermark crop protection: lengthened hero track to `400vh`, zoomed canvas by 1.16x and offset upward by 5% in `drawFrame`, and calibrated GSAP scale (`1.28` -> `1.14`) so bottom AI image watermarks are permanently clipped.
    - Unboxed right-hand hero presentation: liberated elements from rigid bordered containers into an asymmetric, layered editorial dossier layout with live detective dispatch telemetry, tactile file tabs (`01 ABOUT`, `02 CASES & RANKS`, `03 GITHUB`), and smooth `motion` transitions.
    - Built interactive Vertical Detective Timeline Meter (`VerticalInvestigateTimeline.tsx`) positioned alongside right-hand content with dynamic red thread scrubbing, evidence ruler tick marks, and scrub percentage readout.
    - Implemented 3D Floating Detective Background Scene (`FloatingDetectiveScene.tsx`) with Three.js WebGL: features floating Manila case files, coroner autopsy reports, telegraph wiretap slips, Polaroid exhibit photos, warm brass desk lamp volumetric lighting, and 180 floating dust motes with mouse/scroll parallax.
    - Added animated police evidence barrier tape ticker (`CrimeSceneTape.tsx`) and procedural Three.js volumetric smoke/cloud separator (`NoirCloudSeparator.tsx`).
    - Purged the term "dossier" across user-facing pages and components, replacing it with "case", "case file", and "investigation".
    - Added prominent The Sam Studios production redirect card in the footer linking to `https://thesamstudios.in`.
    - Overhauled legal page (`src/app/(public)/legal/page.tsx`): replaced Scotland Yard parody and 1947 references with professional 2026 Terms of Service & Privacy Policy clauses, and added "Return to Home" button.
    - Validated with `bun run check` (0 lint errors, 0 type errors, 18/18 tests pass) and multi-viewport Playwright headless browser testing (desktop 1440x900, tablet 768x1024, mobile 390x844).

---

## 3. Pending Information & Next Steps

1. **Phase M5 Execution**: Proceed with Leaderboard (individual & squad), periodic team sync polling hook, security headers, and accessibility audit.
2. **Operational Quality**: 18 test suites passing, zero Biome lint errors, zero TypeScript errors.

Phase M4 and Auth Shell are 100% complete.
Next focus areas:
- **Landing Page GSAP Canvas Animation**: Interactive 3D scroll sequence using sequential frames in `public/landing/frames/`.
- **Phase M5**: Leaderboards, squad sync, and accessibility pass.

---

## 5. Working Tree Status

- Working tree is clean.
- All code formatted and validated via `bun run check`.
- Git remote: `origin` pointing to `https://github.com/DevInfinix/NoShitSherlock.git`.
- Active branch: `main`.

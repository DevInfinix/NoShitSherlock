<div align="center">

<img src=".github/assets/banner.png" alt="NoShitSherlock — Cold Case Crime Dossier" width="100%" />

# NoShitSherlock

**An open-source noir detective game where you crack cold cases from real evidence.**

Inspect suspect dossiers, decode intercepted audio tapes, log verified clues in your field notebook, and thread evidence with red yarn on an interactive timeline pinboard.

<p align="center">
  <a href="https://github.com/DevInfinix/NoShitSherlock/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/DevInfinix/NoShitSherlock/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=E7DDC8&label=CI&color=641B1B&labelColor=15110F" alt="CI Status" />
  </a>
  <a href="https://github.com/DevInfinix/NoShitSherlock/stargazers">
    <img src="https://img.shields.io/github/stars/DevInfinix/NoShitSherlock?style=for-the-badge&logo=apachespark&logoColor=E7DDC8&label=STARS&color=A9874A&labelColor=15110F" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/DevInfinix/NoShitSherlock/network/members">
    <img src="https://img.shields.io/github/forks/DevInfinix/NoShitSherlock?style=for-the-badge&logo=git&logoColor=E7DDC8&label=FORKS&color=A9874A&labelColor=15110F" alt="GitHub Forks" />
  </a>
  <a href="https://github.com/DevInfinix/NoShitSherlock/issues">
    <img src="https://img.shields.io/github/issues/DevInfinix/NoShitSherlock?style=for-the-badge&logo=codefactor&logoColor=E7DDC8&label=ISSUES&color=A92A28&labelColor=15110F" alt="Issues" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/LICENSE-APACHE--2.0-641B1B?style=for-the-badge&logo=open-source-initiative&logoColor=E7DDC8&labelColor=15110F" alt="License" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/PostgreSQL_17-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon_Serverless-00E599?style=flat-square&logo=neon&logoColor=black" alt="Neon" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Bun_Runtime-FBF0DF?style=flat-square&logo=bun&logoColor=black" alt="Bun" />
</p>

---

[The Experience](#the-experience) ✦ [Core Mechanics](#core-mechanics) ✦ [Interface Preview](#interface-preview) ✦ [Architecture](#system-architecture) ✦ [Self-Hosting](#self-hosting--local-setup) ✦ [Credits](#special-thanks)

---

</div>

## The Experience

Most detective games are either multiple-choice quizzes with mystery wallpaper or visual novels on rails. NoShitSherlock is built around the actual texture of investigative work.

You are handed an archival case folder containing crime-scene photographs, autopsy summaries, phone company transcripts, and suspect interrogations. You read between the lines, solve progressive deduction puzzles to verify leads, collect physical clues into your field notebook, and construct the final narrative on a corkboard timeline using yarn.

### What Makes It Different

▸ **Zero Hand-Holding**  
The game never answers for you. Every breakthrough requires cross-referencing conflicting testimonies, spotting inconsistencies in timestamps, and finding anomalies in crime-scene images.

▸ **Collaborative Squad Play**  
Create a team with a short 8-character dispatch code. Your squad shares the case folder, sees clues unlock in real time, and works together on the timeline board. Individual contributions remain tracked on the scoreboard.

▸ **Tactile Noir Aesthetic**  
Built with worn paper shaders, aged manila folders, editorial serif typography, physical page-turns, and tactile evidence cards. No corporate dashboards, no generic neon badges.

▸ **Instant Performance**  
Fast, lightweight web application built on Next.js 16 and Bun. Pages load instantly without multi-gigabyte client downloads or heavy game engines. Play right inside any modern browser on desktop or tablet.

---

## Core Mechanics

```text
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │   1. DOSSIER    │  ───▶ │   2. NOTEBOOK   │  ───▶ │   3. PINBOARD   │
  │ Open Case File  │       │ Collect Clues   │       │ Reconstruct Day │
  │ 5 Stage Puzzles │       │ Verify Leads    │       │ Thread Red Yarn │
  └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **The Investigation Dossier**  
   Each case unfolds across five distinct puzzle acts:
   - **Fill-in-the-Blank Dashes**: Fill missing ledger entries or cipher keys from contextual text.
   - **Deductive MCQ**: Pick the only scenario consistent with forensic evidence.
   - **True / False Interrogations**: Validate witness statements against crime scene records.
   - **Cryptic Notes**: Decipher handwritten margin notes, passwords, and encoded messages.
   - **Voicemail Audio & Transcripts**: Listen to wiretaps and parse recorded conversations for timeline contradictions.

2. **The Detective Notebook**  
   Correct deductions unlock verified case clues into your personal field notebook. Clues carry photographic fragments, suspect quotations, forensic stamps, and key timestamps.

3. **The Chronological Pinboard**  
   Once the dossier is cleared, the folder closes and transforms into an evidence pinboard. Drag clue cards into correct chronological order, connect them with red yarn, and lock in the final indictment.

---

## Interface Preview

<div align="center">

| Investigative Folder | Detective Notebook | Evidence Pinboard |
| :---: | :---: | :---: |
| <img src="https://placehold.co/640x360/15110F/E7DDC8?text=Archival+Case+Folder+Preview" width="100%" alt="Case Folder Preview" /> | <img src="https://placehold.co/640x360/15110F/E7DDC8?text=Detective+Notebook+Preview" width="100%" alt="Notebook Preview" /> | <img src="https://placehold.co/640x360/15110F/E7DDC8?text=Timeline+Pinboard+Preview" width="100%" alt="Pinboard Preview" /> |
| *Worn folder pages & five puzzle types* | *Clue collection with timestamps* | *Drag-and-drop chronological yarn board* |

*High-resolution gameplay screenshots will be updated with the M3 and M4 gameplay releases.*

</div>

---

## System Architecture

The game enforces strict server-authoritative state. The browser renders the interface and animations; the database is the sole arbiter of truth.

### Guarantees

- **No Answer Leakage**: Correct answers, accepted spelling variants, and `is_correct` flags never travel to the client in payloads or bundles.
- **Strict Concurrency Safety**: Submissions run inside isolated PostgreSQL transactions with row-level locks (`SELECT ... FOR UPDATE`). When two squad members submit simultaneously, exactly one attempt is counted and scored.
- **Atomic Scoring**: Deductions, hints, wrong attempt penalties, and clue unlocks resolve in a single database transaction. Scores can never drop below zero.

### Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Player as Detective (Client)
    participant Action as Server Action
    participant Service as Game Engine
    participant DB as Neon / Postgres 17

    Player->>Action: Submit deduction attempt
    Action->>Action: Validate session & Zod schema
    Action->>Service: submitAnswer(sessionId, questionId, answer)
    
    rect rgb(21, 17, 15)
        Note over Service,DB: Single PostgreSQL Transaction
        Service->>DB: Lock question state (FOR UPDATE)
        Service->>DB: Check attempts left & anti-spam delay
        Service->>DB: Record attempt in session_answers
        alt Answer is Correct
            Service->>DB: Mark solved, grant points, unlock linked clues
        else Answer is Incorrect
            Service->>DB: Increment penalty, apply score deduction
        end
    end

    DB-->>Service: Return transaction result
    Service-->>Action: Return safe status (solved, pointsAwarded, newClues)
    Action-->>Player: Update notebook & render feedback
```

---

## Tech Stack

| Layer | Selection | Justification |
|---|---|---|
| **Runtime & Tests** | Bun 1.4+ | Fast installation, native TypeScript execution, high-performance test suite |
| **Framework** | Next.js 16 (App Router) | React 19 Server Components, Server Actions, Turbopack, standalone Docker output |
| **Styling** | Tailwind CSS v4 | CSS theme tokens (`--color-ink`, `--color-paper`, `--color-oxblood`, `--color-brass`) |
| **Database** | PostgreSQL 17 / Neon | ACID transactions, row-level locks, serverless scaling with pooled & direct connections |
| **ORM** | Drizzle ORM & Kit | Type-safe SQL dialect, zero runtime overhead, reproducible schema migrations |
| **Authentication** | Better Auth | Email OTP, Google, GitHub, and Discord OAuth; secure session cookies |
| **Interactions** | Motion & `@dnd-kit` | Accessible drag-and-drop on pinboard, physical folder page-flips, keyboard navigation |
| **Code Hygiene** | Biome 2.5 | Sub-millisecond formatting and linting, strict TypeScript rules |

---

## Self-Hosting & Local Setup

### Prerequisites

- [Bun](https://bun.sh/) (version 1.2.0 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### 1. Clone & Install

```bash
git clone https://github.com/DevInfinix/NoShitSherlock.git
cd NoShitSherlock
bun install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

| Key | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | Pooled connection string for queries | `postgresql://postgres:postgres@localhost:5432/noshitsherlock` |
| `DATABASE_URL_UNPOOLED` | Direct connection for schema migrations | `postgresql://postgres:postgres@localhost:5432/noshitsherlock` |
| `BETTER_AUTH_SECRET` | 32-character random string | *Generate via `openssl rand -base64 32`* |
| `NEXT_PUBLIC_APP_URL` | Base application URL | `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API key for email OTP codes | `re_...` |

### 3. Start Local Database

Spin up the local PostgreSQL 17 container:

```bash
docker compose up db -d
```

### 4. Run Migrations & Seed Content

```bash
bun run db:migrate
bun run db:seed
```

### 5. Start Development Server

```bash
bun run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to open the case archives.

### Full Docker Container Setup

To run both the application and database in containerized production mode:

```bash
docker compose up --build
```

---

## Development Scripts

```bash
bun run dev          # Start local dev server (Turbopack)
bun run build        # Compile production standalone build
bun run start        # Launch compiled Next.js standalone runner
bun run check        # Comprehensive quality gate: lint + typecheck + tests
bun run lint         # Run Biome linter across workspace
bun run format       # Format all source files with Biome
bun run typecheck    # Validate strict TypeScript compiler checks
bun run test         # Execute test suite using Bun test runner
bun run db:generate  # Generate Drizzle migration files
bun run db:migrate   # Execute pending migrations
bun run db:seed      # Seed case dossiers into database
bun run db:studio    # Launch visual Drizzle Studio database browser
```

---

## Contributing

We welcome community contributions. Every change requires an open issue before opening a pull request.

1. Review [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
2. Create a branch: `type/<issue-number>-short-slug` (e.g. `feat/12-clue-pinboard`).
3. Follow Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.
4. Ensure `bun run check` passes before pushing changes.

---

## Special Thanks

A huge thank you to the creative contributors who brought the cold cases of NoShitSherlock to life:

- **Ayurda** ([@ayurdapatil](https://github.com/ayurdapatil)) — Images and Visual Assets
- **Shashwat** ([@kilmngrrr](https://github.com/kilmngrrr)) — Case Files and Detective Narratives

---

## Legal & Content Rights

- **Software Code**: Licensed under the [Apache License 2.0](LICENSE).
- **Brand & Identity**: The name "NoShitSherlock", custom logos, and design trademarks are reserved by DevInfinix / thesamstudios.in.
- **Narrative Content & Media**: All case storylines, clue narratives, puzzle documents, audio wiretaps, and visual artwork located in `content/` and `public/cases/` are **All Rights Reserved** and exempt from the open-source code license.

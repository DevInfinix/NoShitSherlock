# NoShitSherlock

[![CI](https://github.com/DevInfinix/noshitsherlock/actions/workflows/ci.yml/badge.svg)](https://github.com/DevInfinix/noshitsherlock/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

An open-source noir detective web game. Players open a case folder, investigate 5 sections of mixed puzzles (fill-in-the-blank, multiple choice, true/false, cryptic, voicemail transcripts), gather clues in a detective notebook, and arrange the clues chronologically on an evidence pinboard with yarn to crack the case.

---

## Features

- **Immersive Noir Aesthetic**: Rich dark palette, worn paper evidence folders, typewriter and editorial typography, and physical yarn pinboards.
- **5 Progressive Puzzle Formats**: Fill-in-the-blank dashes, multiple-choice deductions, true/false assertions, cryptic ciphers, and audio voicemail transcripts.
- **Detective Notebook & Clue Unlocking**: Verifiable clues unlock progressively into your notebook upon correct deductions.
- **Interactive Chronological Pinboard**: Physical-feeling drag-and-drop evidence board to reconstruct the crime timeline.
- **Solo & Team Multiplayer**: Investigate alone or team up with colleagues using lightweight team join codes and shared progress.
- **Server-Authoritative State**: Scores, clues, and answer verification are strictly processed server-side inside PostgreSQL transactions.
- **Global & Team Leaderboards**: Transparent speed and precision rankings for completed cases.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime & Tests** | [Bun](https://bun.sh/) |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript strict) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Animation & Drag** | [Motion](https://motion.dev/), [GSAP](https://gsap.com/), `@dnd-kit` |
| **Database & ORM** | PostgreSQL 17, [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [Better Auth](https://www.better-auth.com/) (Email OTP, Google, GitHub, Discord) |
| **Validation & State** | Zod, Zustand |
| **Code Hygiene** | [Biome](https://biomejs.dev/), Husky, lint-staged, commitlint |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (>= 1.2.0)
- [Docker](https://www.docker.com/) & Docker Compose (for local PostgreSQL 17)

### Local Development (Bun)

1. Clone the repository:
   ```bash
   git clone https://github.com/DevInfinix/noshitsherlock.git
   cd noshitsherlock
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start local PostgreSQL database:
   ```bash
   docker compose up db -d
   ```

5. Apply database migrations and seed initial data:
   ```bash
   bun run db:migrate
   bun run db:seed
   ```

6. Start development server:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Full Docker Setup

Run the entire application stack (PostgreSQL + Next.js web application):

```bash
docker compose up --build
```

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build production Next.js standalone application |
| `bun run start` | Run production Next.js application |
| `bun run lint` | Lint codebase with Biome |
| `bun run format` | Format codebase with Biome |
| `bun run typecheck` | Run strict TypeScript compiler checks |
| `bun run test` | Run test suite with `bun test` |
| `bun run check` | Run lint, typecheck, and tests in sequence |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run Drizzle migrations against PostgreSQL |
| `bun run db:seed` | Seed authored case content into database |
| `bun run db:studio` | Open Drizzle Studio visual inspector |

---

## Asset Provenance & Content Rights

- **Artwork and Audio**: Visual case assets and audio recordings are created offline with AI generation tools and curated for narrative cohesion. No real persons or copyrighted materials are depicted.
- **Brand & Logo Reservation**: The name "NoShitSherlock", the project logo, and all brand marks are proprietary and reserved by DevInfinix / thesamstudios.in.
- **Content Exemption**: All case storylines, clue narratives, puzzle designs, artwork, and audio files located in `content/` and `public/cases/` are **All Rights Reserved** and not licensed under the code license unless explicitly stated otherwise in a case specification.

---

## License

The code in this repository is licensed under the [Apache License 2.0](LICENSE).
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

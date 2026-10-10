# Implementation plan, data, and safety

## Approved stack

Retain Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Motion, dnd-kit, Zustand, Zod, PostgreSQL, Drizzle, Better Auth, Resend, Bun, and Biome. Add in a foundation issue: `gsap`, `@gsap/react`, `lenis`, `three`, `@types/three`, `@react-three/fiber`, and `@react-three/drei`. Three.js is optional and dynamically imported for the decorative landing canvas only.

Do not add TanStack Query, a page-flip library, CDN SDK, Redis, or generic animation package in v1. Use Server Components/Actions, native accessible controls, and database attempt/interval rules. Select an exact maintained PDF extractor and image optimiser only when implementing the content importer; review official documentation and lock versions with Bun.

## Auth, consent, and age gate

Offer Google, GitHub, Discord, and email/password. Social is the quick path; email/password is the verified fallback. Better Auth plus Resend uses a six-digit email OTP:

1. Continue only if a provider returns a usable verified email.
2. A provider without email (notably Discord) authenticates the account but stops at `Add your email`.
3. Email OTP expires in 10 minutes, is single-use, securely stored/compared, rate-limited per email/IP, and has an attempt cap; only then can onboarding continue.
4. Email/password accounts pass the same verification gate before entering the game.

Require two initially unchecked checkboxes with links: `I confirm that I am at least 13 years old and agree to the Terms of Service` and `I acknowledge the Privacy Notice.` A separate marketing opt-in is optional and off by default. Store user id, accepted document version, and acceptance timestamp in `legal_acceptances`. Block self-declared under-13 users before profile collection.

The project launches worldwide for ages 13+. This is engineering guidance, not legal advice: engage counsel before launch to publish Terms and Privacy Notice covering operator/contact details, data use/retention/deletion, third-party processors, user rights, acceptable use, dispute/governing-law terms, and country-specific requirements. Engineering must provide account deletion, data export, versioned consent, and contact/support.

## Schema additions

Use Drizzle migrations only. Keep Better Auth ids as text.

```text
agent_profiles
  user_id PK/FK -> user; agent_tag UNIQUE six digits; display_name
  onboarding_completed_at nullable; created_at; updated_at

legal_documents
  id PK; document_type (TERMS|PRIVACY); version UNIQUE; published_at; body_url

legal_acceptances
  id PK; user_id FK -> user; legal_document_id FK -> legal_documents; accepted_at
  UNIQUE(user_id, legal_document_id)
```

Agent tags are public identifiers, never credentials. New question types (`ORDER`, `MATCH`, `LIMITED_CHOICE`, `TIMELINE`, `FREE_TEXT_CONCEPTS`, `BUCKET_SORT`) require content-schema update, migration where applicable, server validator, and tests. Submit stable item ids, never correctness metadata.

## Server and delivery plan

Every mutation is: authenticated user → ownership/team check → Zod parse → service → one database transaction → safe result. Lock answer state; prevent duplicate score; record attempt; update state; apply penalty; unlock clues. Final board and reconstruction use the same discipline. Return typed friendly domain errors, never answers, requirements, raw PDFs, or SQL errors.

Build in order: (1) foundation, auth, OTP, consent tables/legal placeholder pages; (2) importer, manifest, schema, twice-safe seed; (3) services and concurrency tests; (4) landing, onboarding, library, folder, board, and results with static/reduced-motion fallbacks; (5) keyboard/touch/a11y, visual screenshots, bundle/slow-network test, security review, `bun run check`.

Phase 4 starts with the landing page. Before each user-facing page in Phase 4, follow the visual approval gate in `design.md`; do not write its UI until the user approves its page brief. Backend and non-visual work remains autonomous within this plan.

## Font delivery

Provide a licensed webfont bundle to the coding agent: WOFF2 files for approved family/styles plus licence/EULA proving web embedding. Put them in `src/app/fonts/` (or private build assets if redistribution is prohibited), import via `next/font/local`, and use the design-system variables. A TTF/OTF zip alone does not prove webfont hosting is permitted.

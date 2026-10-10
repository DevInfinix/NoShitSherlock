# NoShitSherlock — Engineering Handoff

Read [the project rules](../NoShitSherlock%20%5BAssets%5D/AGENTS-v1.md) first. This compact handoff is intentionally limited to three supporting documents so a coding agent can work without hunting for context. The rules file wins if there is a conflict.

1. [Product and design system](docs/design.md) — exact visual direction, routes, interactions, landing motion, responsive rules, and supplied-reference interpretation.
2. [Case content pipeline](docs/content-pipeline.md) — Google Drive source convention, PDF/image import, `case.json`, Case 01’s real game contract, and asset performance.
3. [Implementation plan](docs/implementation.md) — approved libraries, auth, consent, schema additions, security, and build order.

## Non-negotiables

- The database is authoritative; correct answers and score logic never reach the browser.
- A PDF is an authoring input, never a gameplay renderer at request time.
- The landing experience can be cinematic, but must degrade to a fast, usable static experience on low-power, touch, and reduced-motion environments.
- Treat every data-model or package change as a small issue and a migration/lockfile change, not an ad hoc edit.

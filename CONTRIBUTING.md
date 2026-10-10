# Contributing to NoShitSherlock

Thank you for your interest in contributing to NoShitSherlock!

## License Agreement

By contributing to NoShitSherlock, you agree that your contributions will be licensed under the project's [Apache License 2.0](LICENSE).

Case content, case narratives, artwork, and audio files are proprietary and subject to all rights reserved.

---

## Development Workflow

1. **Open an Issue First**:
   Every change must be associated with an issue. Please use the issue templates and wait for discussion before opening substantial pull requests.

2. **Branch Naming**:
   Create a branch following the convention:
   `type/<issue-number>-short-slug`
   (e.g., `feat/12-answer-transaction`, `fix/45-pinboard-drop-target`).

3. **Conventional Commits**:
   Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`
   - Imperative subject line under 72 characters (e.g., `feat: implement answer verification transaction`)
   - Commits must be small, atomic, and logically cohesive.

4. **Code Quality and Checks**:
   Before submitting or committing code, run:
   ```bash
   bun run check
   ```
   This executes Biome linting, TypeScript strict type-checking, and tests. Never submit code with failing checks.

5. **Pull Requests**:
   - Link the relevant issue (e.g., `Closes #12`).
   - Fill out the PR template completely.
   - Include visual screenshots or recordings for any UI changes.

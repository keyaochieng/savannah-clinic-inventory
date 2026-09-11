# StockPulse — Clinic Stock Console

A clinic stock console for searching, filtering, and correcting inventory from
ward tablets, where every item is a shareable URL and every screen stays usable
when the network is slow or a request fails.

Built on the [DummyJSON](https://dummyjson.com/docs) API, treating its product
catalogue as the clinic's stock catalogue.

## Status

In progress. Tooling and CI are set up; feature build underway.

## Tech stack

- **React + TypeScript** (Vite)
- Data fetching/caching: _to be added_
- Routing: _to be added_

## Running locally

Requires Node 18+ (built on Node 25; CI runs on Node 22 LTS).

```bash
npm install
npm run dev
```

## Scripts

- \`npm run dev\` — start the dev server
- \`npm run build\` — type-check and build for production
- \`npm run lint\` — run ESLint
- \`npm run format\` — format all files with Prettier
- \`npm run format:check\` — check formatting without writing (used in CI)

## Tooling and CI

- **Prettier** + **.editorconfig** for consistent formatting
- **ESLint** (flat config) with a chosen ruleset
- **commitlint** + **husky** enforcing Conventional Commits locally via a
  commit-msg hook, plus format/lint on pre-commit
- **GitHub Actions** runs format check, lint, and commit-message checks on
  every PR; these must pass before merge

## Design notes, decision log, and AI reflection

_Design write-up (Section 1), decision log, and AI reflection to follow in
subsequent commits._
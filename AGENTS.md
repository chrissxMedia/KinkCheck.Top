# KinkCheck.Top — Agent Guide

## Project Overview

`KinkCheck.Top` (often abbreviated as KCT) is an Astro-based web app built with Preact components that displays Templates and allows users to fill them out.

## Key Terminology

- **Template**: The form structure presented to the user (e.g. "KinkCheck Classic"). Stored as Content Collections in YAML. Each revision lives in a separate file named `templates/[template_id]/[template_revision].yaml`.
- **Check**: What a user fills out on the site. Currently a nested list of ratings stored in the SQLite DB. Each Check references its Template by `id` and `revision`, so it can be "upgraded" to a newer revision later.

## Project Structure

`src/pages/internal/` contains features under development. `src/base.ts` contains Check rating conversion and update helpers. `src/zod.ts` defines common data schemas and types.

## Middleware

The middleware checks apply only to Astro Actions. They block Actions when `GIT_REF` is `"daddy"` and apply an in-memory rate limit otherwise. Page requests pass through.

## Code Style & Patterns

Application scripts use TypeScript with a strict tsconfig. Preact components use `.tsx`; import from `"preact"` and `"preact/hooks"`, not React.

Preact component CSS lives in a matching `.module.css` file. Import it as `styles` and use classes such as `styles.category`. Astro components and pages use scoped `<style>` blocks.

## Database

`user_id` is optional because user accounts are planned.

**Connection lifecycle**: Import `db` from `src/db/index.ts`. The module opens one SQLite connection when loaded and applies pending migrations. `KCT_DATABASE_FILE` selects the database file and defaults to `./.dev.db`.

## Testing

Run `npm run test` (Vitest).

## CI / GitHub Actions

The main workflow runs tests, checks that migrations are current, then builds, smoke-tests, and pushes one multi-platform Docker image.

Two environment variables are passed at build time:

| Variable | Purpose |
|---|---|
| `GIT_SHA` | Current commit hash (displayed in the footer and used to name database backups) |
| `GIT_REF` | Branch name (used for prod gating in middleware) |

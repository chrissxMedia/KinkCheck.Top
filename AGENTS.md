# KinkCheck.Top — Agent Guide

## Project Overview

`KinkCheck.Top` is an Astro-based web app built with Preact components that displays Templates and allows users to fill them out. It stores persistent Check data in a SQLite database, uses YAML files for configuration / data seeding, and exposes a previewable server via the `@astrojs/node` adapter (standalone mode).

The project name is **KinkCheck.Top**, often abbreviated as KCT (`package.json` has `"name": "kinkcheck"` but all CLI scripts reference it through Astro — ignore that mismatch unless it's part of the issue surface).

## Key Terminology

- **Template**: The form structure presented to the user (e.g. "KinkCheck Classic"). Stored as Content Collections in YAML — not in the DB. Each revision lives in a separate file named `templates/[template_id]/[template_revision].yaml`.
- **Check**: What a user fills out on the site. Currently a nested list of ratings stored in the SQLite DB. Each Check references its Template by `id` and `revision`, so it can be "upgraded" to a newer revision later.

## Project Structure

```
src/
  db/             # Database config files and util functions
  components/     # Re-usable UI components (Astro, Preact)
  layouts/        # Layout files (MarkdownLayout.astro for Markdown content, Layout.astro for all other pages)
  actions/        # Server-side Astro Actions (auto-exposed at /_actions/*)
  middleware.ts   # Request middleware (rate limiter, prod gating) — auto-discovered by Astro
  base.ts         # Type definitions and util functions used in many places
  pages/
    internal/     # Pages that are still under construction
```

## Middleware

Astro auto-discovers `src/middleware.ts`. It exports a single `onRequest` handler wrapped with `defineMiddleware()` from `astro:middleware`.

The middleware currently performs two checks on **Action endpoints** only (detected via `getActionContext()` from `astro:actions`):

1. **Prod gate**: If `GIT_REF` env server var is `"daddy"`, return HTTP 400 — the feature is blocked in production.
2. **Rate limiter**: In-memory sliding window keyed by `context.clientAddress`. Max **5 requests per 10-minute window** per IP. Returns HTTP 429 when exceeded.

Key rules:
- Middleware must always return a `Response` — either directly or via `await next()`.
- Non-action requests (page views, static assets) bypass all middleware checks and call `next()` immediately.
- To add more middleware behaviors, edit the single handler or use `sequence()` from `astro:middleware` for multiple handlers.

## Astro Actions

Server Actions live in `src/actions/`. They are publicly invocable by name at `/_actions/<namespace>.<name>`.

## Code Style & Patterns

**TypeScript only** — strict tsconfig. All files are `.ts` or `.tsx`. Preact is used instead of React, import from `"preact"` not `"react"`.

**CSS is module-scoped**: Component CSS for Preact components lives in a matching `.module.css` file alongside each component. Use `import "./Kink.module.css";` imports to apply styles via class names returned from styled-component destructuring. Component CSS for Astro components/pages lives in the `.astro` file and is automatically scoped at compile-time.

## Database

Database is SQLite (Drizzle ORM). Schema lives in `src/db/config.ts`. Migrations are checked into git at `migrations/` and applied automatically by the DB code at runtime. The tables are:
- **checks**: stores Check entries with fields (`id`, `template_id`, `template_revision`, `created_at`, `user_id`, `data`). The JSON-stored `data` column holds the primary content payload (ratings). The `user_id` is optional — user accounts will be added in the future to let users own their Checks.

**Connection lifecycle**: Import `db` from `src/db/index.ts` — this opens a new SQLite connection with Drizzle, seeds an initial empty row structure, backs up existing data pre-migration, then persists to disk on close via `db.close()`.

## Testing

The project uses **Vitest**. (`npm run test`) Tests are found in `test/*.test.ts`.

## CI / GitHub Actions

Workflows live under `.github/workflows/main.yml`. CI runs linting, precompile, builds the Docker images separately for testing and production.

Two environment variables are passed at build time:

| Variable | Purpose |
|---|---|
| `GIT_SHA` | Current commit hash (displayed in the footer) |
| `GIT_REF` | Branch name (used for prod gating in middleware) |

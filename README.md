# KinkCheck.Top

A web app for creating and filling out Templates, backed by Astro + Preact + Drizzle + SQLite.

## Architecture (high level)

| Layer | Tech | What it does |
|---|---|---|
| **Frontend** | Astro pages + Preact components | SSR-rendered pages with interactive UI islands |
| **Actions** | Astro Actions | Public "API" at `/_actions/*`, will be used for saving Checks |
| **Middleware** | Astro Middleware | Rate limiting & production gating on all Action calls |
| **User Data** | Drizzle ORM + SQLite | Persistent Check storage |

For implementation details, conventions, and development commands see **[AGENTS.md](AGENTS.md)**.

## Vocabulary

- **Template**: The "form" presented to users (e.g. "KinkCheck Classic"). Stored as Content Collections in YAML files. Each revision lives in a separate `templates/[template_id]/[template_revision].yaml` file.
- **Check**: What a user fills out on the site — currently a nested list of ratings, soon stored in SQLite. Each Check references its Template by `id` and `revision`, allowing it to be presented as it was filled out, or upgraded to a newer revision.

## Getting started

```bash
npm install
npm run dev
```

## Branches & Deployment

| Branch | URL |
|---|---|
| `daddy` (main/prod) | [KinkCheck.Top](https://kinkcheck.top) |
| `bottom` (beta) | [Bottom.KinkCheck.Top](https://bottom.kinkcheck.top) |

Two environment variables are passed by CI (not needed locally):

| Variable | Purpose |
|---|---|
| `GIT_SHA` | Current commit hash (only used for the footer) |
| `GIT_REF` | Branch name (also used for production gating in middleware) |

## Contributing

Issue tracker and pull requests are open — improvements, bug fixes, and feature suggestions are welcome.

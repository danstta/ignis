# Contributing to Ignis

Thanks for your interest! Ignis is early-stage and intentionally narrow in scope. Before starting a large PR, please **open an issue first** so we can agree on the direction — small fixes and doc improvements are welcome directly.

## Dev setup

Requirements: [Bun](https://bun.sh) and a PostgreSQL database.

```bash
cp .env.example .env.local   # fill in DATABASE_URL etc.
bun install
bun run db:migrate
bun run dev
```

To execute workflow runs locally, start the Inngest dev server in a second terminal:

```bash
bunx inngest-cli@latest dev
```

## Quality bar

Before opening a PR, make sure this passes:

```bash
bun run lint && bun run typecheck && bun test
```

Keep PRs focused — one change per PR, with a short description of what and why.

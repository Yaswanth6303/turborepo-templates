# Turborepo — Next.js · Tailwind CSS · Prisma · oxlint · oxfmt

## What's inside

| Path                         | Description                                                        |
| ---------------------------- | ------------------------------------------------------------------ |
| `apps/web`                   | Next.js app (port 3001), uses `@repo/database` (`/api/health`)     |
| `apps/docs`                  | Next.js app (port 3000)                                            |
| `packages/ui`                | Shared React components, compiled with Tailwind CSS (`ui:` prefix) |
| `packages/database`          | Prisma 7 client (Postgres via `@prisma/adapter-pg`)                |
| `packages/tailwind-config`   | Shared Tailwind CSS theme and PostCSS config                       |
| `packages/typescript-config` | Shared `tsconfig.json` presets                                     |

Tooling: [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting, [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting (with Tailwind class sorting), Turborepo for tasks, Bun as the package manager.

## Getting started

```sh
cp .env.example .env
cp .env.example packages/database/.env
cp .env.example apps/web/.env

docker compose up -d        # local Postgres on :5432
bun run db:migrate          # create & apply the first migration
bun run db:seed             # optional
bun run dev
```

Check the database connection: <http://localhost:3001/api/health>

## Scripts

| Command                        | What it does                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `bun run dev`                  | Start all apps (generates the Prisma client first)                              |
| `bun run new:next-app <name>`  | Add a Next.js app in `apps/` (`--db`, `--port <n>`), no ESLint                  |
| `bun run new:ts-app <name>`    | Add a Node.js TypeScript app (API, worker, …) in `apps/` (`--db`, `--port <n>`) |
| `bun run new:js-app <name>`    | Same, in JavaScript                                                             |
| `bun run new:react-app <name>` | Add a React + TypeScript SPA built with Vite+ (`vp dev`, `vp build`, `vp test`) |
| `bun run build`                | Production build of every app and package                                       |
| `bun run check-types`          | Type-check everything                                                           |
| `bun run lint`                 | oxlint, fails on any warning                                                    |
| `bun run lint:fix`             | oxlint with auto-fix                                                            |
| `bun run format`               | Format with oxfmt                                                               |
| `bun run format:check`         | Check formatting (CI)                                                           |
| `bun run db:generate`          | Generate the Prisma client                                                      |
| `bun run db:migrate`           | Create and apply a migration (development)                                      |
| `bun run db:deploy`            | Apply pending migrations (production)                                           |
| `bun run db:push`              | Push the schema without a migration (prototyping)                               |
| `bun run db:seed`              | Run `packages/database/prisma/seed.ts`                                          |
| `bun run db:studio`            | Open Prisma Studio                                                              |

## Adding an app

```sh
bun run new:next-app admin        # Next.js app on the next free port
bun run new:next-app admin --db   # also uses @repo/database
```

```sh
bun run new:ts-app api --db  # Node.js TypeScript app (tsx dev, tsup build, /health)
bun run new:js-app worker    # Node.js JavaScript app
bun run new:react-app dash   # React SPA built with Vite+ (https://viteplus.dev)
```

Every new app uses the root oxlint/oxfmt and the shared TypeScript, Tailwind and UI packages. Don't use `create-next-app` inside `apps/`: it adds ESLint.

## Using the database in an app

```ts
import { prisma } from "@repo/database";

const users = await prisma.user.findMany();
```

Add `"@repo/database": "*"` to the app's dependencies first. Only import it from server code (route handlers, server components, server actions).

## Deploying

- Set `DATABASE_URL` in your hosting provider.
- Run `bun run db:deploy` before (or as part of) each release.
- CI (`.github/workflows/ci.yml`) runs format check, lint, type-check and build on every push and PR.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/graph.svg?title=Turborepo+Templates&subtitle=Next.js+%C2%B7+Tailwind+%C2%B7+Prisma+or+Drizzle+%C2%B7+oxlint+%C2%B7+oxfmt&logo=turborepo&mode=dark" />
    <img alt="Turborepo Templates — Next.js · Tailwind · Prisma or Drizzle · oxlint · oxfmt" src="https://shieldcn.dev/header/graph.svg?title=Turborepo+Templates&subtitle=Next.js+%C2%B7+Tailwind+%C2%B7+Prisma+or+Drizzle+%C2%B7+oxlint+%C2%B7+oxfmt&logo=turborepo&mode=light" />
  </picture>
</p>

<p align="center">
  Production-ready Turborepo starters for Bun.<br />
  Pick Prisma or Drizzle with one URL. Linting, formatting, Tailwind, Postgres and CI are already set up,<br />
  and one command adds a new Next.js, Node.js or React app that follows the same setup.
</p>

<p align="center">
  <a href="https://github.com/Yaswanth6303/turborepo-templates/stargazers"><img alt="GitHub stars" src="https://shieldcn.dev/github/stars/Yaswanth6303/turborepo-templates.svg?variant=secondary" /></a>
  <a href="https://github.com/Yaswanth6303/turborepo-templates/commits/main"><img alt="Last commit" src="https://shieldcn.dev/github/last-commit/Yaswanth6303/turborepo-templates.svg?variant=secondary" /></a>
  <a href="https://turborepo.com"><img alt="Turborepo 2" src="https://shieldcn.dev/badge/Turborepo-2-EF4444.svg?logo=turborepo&variant=secondary" /></a>
  <a href="https://bun.sh"><img alt="Bun 1.2" src="https://shieldcn.dev/badge/Bun-1.2-000000.svg?logo=bun&variant=secondary" /></a>
</p>

<p align="center">
  <a href="https://nextjs.org"><img alt="Next.js 16" src="https://shieldcn.dev/badge/Next.js-16-000000.svg?logo=nextdotjs&variant=secondary" /></a>
  <a href="https://tailwindcss.com"><img alt="Tailwind CSS 4" src="https://shieldcn.dev/badge/Tailwind_CSS-4-06B6D4.svg?logo=tailwindcss&variant=secondary" /></a>
  <a href="https://www.prisma.io"><img alt="Prisma 7" src="https://shieldcn.dev/badge/Prisma-7-2D3748.svg?logo=prisma&variant=secondary" /></a>
  <a href="https://orm.drizzle.team"><img alt="Drizzle 0.45" src="https://shieldcn.dev/badge/Drizzle-0.45-C5F74F.svg?logo=drizzle&variant=secondary" /></a>
  <a href="https://www.postgresql.org"><img alt="PostgreSQL 17" src="https://shieldcn.dev/badge/PostgreSQL-17-4169E1.svg?logo=postgresql&variant=secondary" /></a>
  <a href="https://oxc.rs"><img alt="oxlint 1.89" src="https://shieldcn.dev/badge/oxlint-1.89-000000.svg?logo=oxc&variant=secondary" /></a>
</p>

---

## Table of contents

1. [What you get](#what-you-get)
2. [Choose a template](#choose-a-template)
3. [Quick start](#quick-start)
4. [Adding apps](#adding-apps)
5. [Project structure](#project-structure)
6. [Scripts](#scripts)
7. [Database](#database)
8. [Linting and formatting](#linting-and-formatting)
9. [Environment variables](#environment-variables)
10. [Continuous integration](#continuous-integration)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Maintaining the templates](#maintaining-the-templates)

## What you get

These templates start from the official Turborepo [`with-tailwind`](https://github.com/vercel/turborepo/tree/main/examples/with-tailwind) example and add the parts you would otherwise set up by hand in every project:

| Area           | Official example    | These templates                                                                  |
| -------------- | ------------------- | -------------------------------------------------------------------------------- |
| Linting        | ESLint, per package | **oxlint**, one config at the root for every app and package                     |
| Formatting     | Prettier            | **oxfmt**, one config at the root, with Tailwind class sorting                   |
| Database       | —                   | **Prisma 7** or **Drizzle**, shared as the `@repo/database` package              |
| Local Postgres | —                   | `docker-compose.yml` (Postgres 17 with a health check)                           |
| Health check   | —                   | `GET /api/health` in the `web` app, which runs a real query against the database |
| New apps       | —                   | `new:next-app`, `new:ts-app`, `new:js-app`, `new:react-app` commands             |
| CI             | —                   | GitHub Actions: format check → lint → type-check → build                         |
| Environment    | —                   | `.env.example` files; `.env` is git-ignored                                      |

Both templates were tested end to end. Each was generated with `create-turbo` and checked with the format check, lint, type-check and build. Both were then migrated and seeded against a real Postgres. Apps created with the `new:*` commands were built and run, including their health checks while the database was down and after it came back.

## Choose a template

Both templates are identical apart from the database layer.

| Template                         | Database layer                                              | Pick it if you want                                                                     |
| -------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`with-prisma`](./with-prisma)   | Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`) | A schema file (`schema.prisma`), generated types, Prisma Studio, managed migrations     |
| [`with-drizzle`](./with-drizzle) | Drizzle ORM 0.45 + drizzle-kit 0.31 (node-postgres)         | Schema and queries written in TypeScript, no code-generation step, plain SQL migrations |

## Quick start

**Requirements:** [Bun](https://bun.sh) (or pnpm, npm or nub), Node.js 24+, and [Docker](https://www.docker.com) for the local database.

### 1. Create a project

```sh
# Prisma
bunx create-turbo@latest my-app -m bun \
  -e https://github.com/Yaswanth6303/turborepo-templates/tree/main/with-prisma

# Drizzle
bunx create-turbo@latest my-app -m bun \
  -e https://github.com/Yaswanth6303/turborepo-templates/tree/main/with-drizzle
```

`create-turbo` copies the chosen template, installs dependencies (the Prisma template also generates the Prisma client here) and creates the first git commit.

> [!NOTE]
> The root `package.json` keeps the template's name (`with-prisma` or `with-drizzle`). Change `"name"` to your project's name.

### 2. Create the `.env` files

```sh
cd my-app
cp .env.example .env
cp .env.example packages/database/.env
cp .env.example apps/web/.env
```

The defaults point at the local Docker database. You don't need to change anything to get started.

### 3. Start Postgres and create the tables

```sh
docker compose up -d     # Postgres 17 on localhost:5432
bun run db:migrate       # create and apply the first migration
bun run db:seed          # optional: insert a demo user
```

### 4. Start the apps

```sh
bun run dev
```

| App             | URL                                |
| --------------- | ---------------------------------- |
| `web`           | <http://localhost:3001>            |
| `docs`          | <http://localhost:3000>            |
| Database health | <http://localhost:3001/api/health> |

If everything is connected, the health URL returns:

```json
{ "status": "ok", "database": "up" }
```

## Adding apps

Never run `create-next-app` or `create vite` inside `apps/`: they add their own ESLint config and dependencies. Use these commands instead. Each one creates `apps/<name>` already connected to the shared setup:

- no ESLint or Prettier; the root oxlint and oxfmt cover the new app automatically
- the shared TypeScript config (`@repo/typescript-config`)
- the next free port, after the ports existing apps already use
- installs dependencies with your package manager (bun, pnpm, npm or nub, read from `package.json` or the lockfile)
- formats only the new app's files

| Command                        | Creates                                                                | `--db` | Typical use                         |
| ------------------------------ | ---------------------------------------------------------------------- | :----: | ----------------------------------- |
| `bun run new:next-app <name>`  | Next.js 16 app with Tailwind and `@repo/ui`                            |   ✅   | Websites, full-stack apps           |
| `bun run new:ts-app <name>`    | Node.js server in TypeScript                                           |   ✅   | APIs, workers, Express/Hono/Fastify |
| `bun run new:js-app <name>`    | Node.js server in JavaScript                                           |   ✅   | Same, without TypeScript            |
| `bun run new:react-app <name>` | React SPA with Tailwind and `@repo/ui` ([Vite+](https://viteplus.dev)) |   —    | Dashboards, admin panels, widgets   |

Options shared by all four:

| Option       | Effect                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------- |
| `--port <n>` | Use this port instead of the next free one                                                   |
| `--db`       | Connect the app to `@repo/database` (not available for React apps, which run in the browser) |

Names must be lowercase letters, numbers and dashes (e.g. `admin`, `billing-api`). The commands refuse a name or port that is already taken. Start a single app with `bun run dev --filter=<name>`.

### Next.js app — `new:next-app`

```sh
bun run new:next-app admin
bun run new:next-app admin --db
```

It's a copy of the `docs` app's setup (Tailwind, `@repo/ui`, shared config) with a fresh starter page. With `--db` it can import `@repo/database` in server code. Scripts: `dev`, `build`, `start`, `check-types`.

### Node.js app — `new:ts-app` / `new:js-app`

```sh
bun run new:ts-app api --db
bun run new:js-app worker
```

Each app is a small `node:http` server with `GET /health`. It shuts down cleanly on `SIGINT`/`SIGTERM` and has a `.env.example` with `PORT` (plus `DATABASE_URL` with `--db`). To use a framework, add it: `bun add express --filter=api`.

| Script        | What it does                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `dev`         | Runs `src/index.*` with `tsx watch`; reloads on change and loads `.env`                          |
| `build`       | Bundles with `tsup` into `dist/index.js`. `@repo/*` code is included; npm packages stay external |
| `start`       | Runs `node dist/index.js` (loads `.env` if present)                                              |
| `check-types` | `tsc --noEmit` (TypeScript apps only)                                                            |

With `--db`, `/health` runs `SELECT 1` through Prisma or Drizzle, whichever the template uses. It returns `200` when the database is reachable and `503` when it isn't, and the server keeps running through database restarts.

### React app — `new:react-app`

```sh
bun run new:react-app dashboard
```

A React 19 + TypeScript single-page app built with [Vite+](https://viteplus.dev), using Tailwind CSS 4 (`@tailwindcss/vite`) and `@repo/ui`. It uses the same React and Tailwind versions as the Next.js apps.

| Script        | What it does                                     |
| ------------- | ------------------------------------------------ |
| `dev`         | `vp dev`: dev server with hot reload             |
| `build`       | `vp build`: static files in `dist/`              |
| `preview`     | `vp preview`: serve the production build locally |
| `test`        | `vp test`: Vitest (import from `vite-plus/test`) |
| `check-types` | `tsc --noEmit`                                   |

- **Linting and formatting still run from the root.** Vite+ has its own `vp check`, which isn't used here. The app's `vite.config.ts` has no `lint`/`fmt` settings, so oxlint and oxfmt treat it like every other app.
- **The first React app adds a root `overrides` entry** (`vite` → `@voidzero-dev/vite-plus-core`). Vite+ requires this so Vite plugins use its version of Vite. With pnpm it goes under `pnpm.overrides`.
- **It runs in the browser,** so it can't import `@repo/database`. Fetch data from an API (a `new:ts-app` server or a Next.js route handler). Browser-visible settings must use the `VITE_` prefix, e.g. `import.meta.env.VITE_API_URL`.

### Shared packages

To share code between apps, create `packages/<name>/package.json` with the name `@repo/<name>` and `"exports": { ".": "./src/index.ts" }`. Then add `"@repo/<name>": "*"` to the apps that use it and run `bun install`. Next.js, Vite+ and tsup all compile workspace TypeScript directly, so the package doesn't need a build step.

## Project structure

```text
my-app/
├── apps/
│   ├── web/                     # Next.js app (port 3001), uses @repo/database
│   │   └── app/api/health/      # GET /api/health → checks the database
│   └── docs/                    # Next.js app (port 3000)
├── packages/
│   ├── database/                # @repo/database: Prisma or Drizzle client + schema
│   ├── ui/                      # @repo/ui: shared React components (Tailwind, `ui:` prefix)
│   ├── tailwind-config/         # @repo/tailwind-config: shared theme + PostCSS config
│   └── typescript-config/       # @repo/typescript-config: shared tsconfig presets
├── scripts/
│   ├── new-next-app.mjs         # bun run new:next-app
│   ├── new-node-app.mjs         # bun run new:ts-app / new:js-app
│   ├── new-react-app.mjs        # bun run new:react-app
│   └── lib/scaffold.mjs         # shared helpers (name/port checks, package manager detection)
├── .github/workflows/ci.yml     # format check → lint → type-check → build
├── .oxlintrc.json               # oxlint config for the whole repo
├── .oxfmtrc.json                # oxfmt config for the whole repo
├── docker-compose.yml           # local Postgres 17
├── .env.example
└── turbo.json                   # task pipeline (build, dev, check-types, db:*)
```

### `packages/database`

<table>
<tr><th>with-prisma</th><th>with-drizzle</th></tr>
<tr>
<td valign="top">

```text
database/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
└── src/
    ├── client.ts     # one PrismaClient, reused
    ├── index.ts      # exports prisma + types
    └── generated/    # generated, git-ignored
```

</td>
<td valign="top">

```text
database/
├── drizzle.config.ts
├── drizzle/          # SQL migrations (commit these)
└── src/
    ├── schema.ts     # tables + inferred types
    ├── client.ts     # one Pool + drizzle, reused
    ├── seed.ts
    └── index.ts      # exports db, schema, operators
```

</td>
</tr>
</table>

Both clients reuse one database connection across Next.js hot reloads, so development doesn't run out of Postgres connections. The Drizzle client also handles dropped connections, so a database restart doesn't crash the app.

### Versions

| Package    | Version                            |
| ---------- | ---------------------------------- |
| Next.js    | 16.3                               |
| React      | 19.3                               |
| Tailwind   | 4.3                                |
| TypeScript | 7.0                                |
| Turborepo  | 2.11                               |
| Prisma     | 7.10.1 (pinned)                    |
| Drizzle    | drizzle-orm 0.45, drizzle-kit 0.31 |
| oxlint     | 1.89                               |
| oxfmt      | 0.74                               |
| Vite+      | 1.3 (React apps only)              |
| tsx / tsup | 4.23 / 9.0 (Node.js apps only)     |
| Node.js    | 24 or newer                        |

## Scripts

Run these from the repo root.

**Everyday**

| Command                | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `bun run dev`          | Start every app in development mode                  |
| `bun run build`        | Production build of every app and package            |
| `bun run check-types`  | Type-check the whole repo                            |
| `bun run lint`         | Lint with oxlint; any warning fails                  |
| `bun run lint:fix`     | Lint and auto-fix what oxlint can                    |
| `bun run format`       | Format every file with oxfmt                         |
| `bun run format:check` | Check formatting without changing files (used in CI) |

**Adding apps** ([details](#adding-apps))

| Command                        | What it does                     |
| ------------------------------ | -------------------------------- |
| `bun run new:next-app <name>`  | Add a Next.js app                |
| `bun run new:ts-app <name>`    | Add a Node.js app in TypeScript  |
| `bun run new:js-app <name>`    | Add a Node.js app in JavaScript  |
| `bun run new:react-app <name>` | Add a React app built with Vite+ |

**Database** ([details](#database))

| Command               | What it does                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bun run db:migrate`  | Create a migration from your schema changes and apply it (development)                                                          |
| `bun run db:deploy`   | Apply pending migrations (production)                                                                                           |
| `bun run db:push`     | Sync the schema without creating a migration (prototyping only)                                                                 |
| `bun run db:seed`     | Insert seed data                                                                                                                |
| `bun run db:studio`   | Open Prisma Studio or Drizzle Studio                                                                                            |
| `bun run db:generate` | **Prisma only.** Regenerate the client. It already runs automatically after install and before `dev`, `build` and `check-types` |

## Database

### Use it in an app

1. Add `"@repo/database": "*"` to the app's `dependencies`, or create the app with `--db`.
2. Import it **only in server code**: Next.js route handlers, server components and server actions, or Node.js apps.

<table>
<tr><th>with-prisma</th><th>with-drizzle</th></tr>
<tr>
<td valign="top">

```ts
import { prisma } from "@repo/database";

const users = await prisma.user.findMany();

const user = await prisma.user.findUnique({
  where: { email: "demo@example.com" },
});
```

</td>
<td valign="top">

```ts
import { db, users, eq } from "@repo/database";

const all = await db.select().from(users);

const user = await db.query.users.findFirst({
  where: eq(users.email, "demo@example.com"),
});
```

</td>
</tr>
</table>

### Change the schema

| Step               | with-prisma                              | with-drizzle                                              |
| ------------------ | ---------------------------------------- | --------------------------------------------------------- |
| 1. Edit the schema | `packages/database/prisma/schema.prisma` | `packages/database/src/schema.ts`                         |
| 2. Create + apply  | `bun run db:migrate` (asks for a name)   | `bun run db:migrate` (`drizzle-kit generate` + `migrate`) |
| 3. Commit          | `packages/database/prisma/migrations/`   | `packages/database/drizzle/`                              |
| 4. In production   | `bun run db:deploy`                      | `bun run db:deploy`                                       |

> [!TIP]
> Use `bun run db:push` only while prototyping. It changes the database without writing a migration file, so production can't replay the change.

## Linting and formatting

oxlint and oxfmt are Rust-based and lint or format the whole repo in milliseconds. They run **once from the root**, so apps and packages don't have their own lint or format config. That includes apps created with the `new:*` commands.

**oxlint** (`.oxlintrc.json`)

- Rule sets: TypeScript, React (including hooks), Next.js, import, unicorn, oxc
- `correctness` rules are errors; `suspicious` rules are warnings
- `bun run lint` fails on any warning (`--max-warnings 0`), in CI as well as locally
- Skips build output, the generated Prisma client and Drizzle migrations

**oxfmt** (`.oxfmtrc.json`)

- Same style as Prettier's defaults: 80 columns, double quotes, trailing commas
- Sorts Tailwind classes in `className`, `cn()`, `clsx()` and `cva()` using the shared theme, like `prettier-plugin-tailwindcss`

To give one app different rules, add an `overrides` entry for its path (e.g. `apps/admin/**`) in the root config. Don't add a config file inside the app.

**VS Code:** install the [oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode), open the repo root, and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": { "source.fixAll.oxc": "explicit" }
}
```

## Environment variables

| Variable       | Where                                                           | Example                                             |
| -------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL` | `packages/database/.env` (CLI), each app that uses the database | `postgresql://postgres:postgres@localhost:5432/app` |
| `PORT`         | Node.js apps (`apps/<name>/.env`)                               | `3002`                                              |
| `VITE_*`       | React apps; the only variables visible in the browser           | `VITE_API_URL=http://localhost:3002`                |

- Each app reads its own `apps/<name>/.env`. The Prisma and Drizzle commands read `packages/database/.env`.
- **Turborepo only passes declared variables to tasks.** `DATABASE_URL` is already declared in `turbo.json`. Add any new variable to the `env` list of the tasks that need it, or it will be `undefined` inside them.
- `.env` files are git-ignored. Commit only `.env.example`.

## Continuous integration

Every project created from a template includes `.github/workflows/ci.yml`. It runs on every push to `main` and on every pull request:

```text
bun install --frozen-lockfile → format:check → lint → check-types → build
```

The build doesn't need a real database. It uses a placeholder `DATABASE_URL`, because database code only connects when a request comes in.

## Deployment

| App type        | Build                          | Run in production                            | Notes                                                       |
| --------------- | ------------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| Next.js         | `bun run build --filter=<app>` | `next start`, or deploy to Vercel            | On Vercel, set the project's root directory to `apps/<app>` |
| Node.js (TS/JS) | `bun run build --filter=<app>` | `node dist/index.js`                         | Set `PORT` and, if used, `DATABASE_URL`                     |
| React (Vite+)   | `bun run build --filter=<app>` | Upload `apps/<app>/dist/` to any static host | Set `VITE_*` variables at build time                        |

Database checklist:

1. Use a managed Postgres in production. `docker-compose.yml` is for local development only.
2. Set `DATABASE_URL` in your hosting provider.
3. Run `bun run db:deploy` before each release.

> [!IMPORTANT]
> On serverless platforms, set `DATABASE_URL` to a **pooled** connection string (for example Neon's pooled URL, Supabase's pooler or PgBouncer). Otherwise every function call opens its own database connection.

## Troubleshooting

<details>
<summary><b>Port 5432 is already in use</b></summary>

Another Postgres (or an SSH tunnel) already uses port 5432. Change the host port in `docker-compose.yml` to e.g. `"5433:5432"`, and use `localhost:5433` in every `DATABASE_URL`.

</details>

<details>
<summary><b>Cannot find module <code>@repo/database</code>, <code>@repo/ui/...</code> or <code>./generated/prisma/client</code> in the editor</b></summary>

Run `bun install` from the repo root (it also generates the Prisma client), then restart the TypeScript server in VS Code: <kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → "TypeScript: Restart TS Server".

</details>

<details>
<summary><b>An environment variable is <code>undefined</code> inside a task</b></summary>

Turborepo filters out variables that aren't declared. Add the variable to the task's `env` list in `turbo.json`.

</details>

<details>
<summary><b><code>bun install</code> says "Blocked 1 postinstall"</b></summary>

That's `@parcel/watcher`, used by the Tailwind CLI. Its install script only builds from source as a fallback, and the prebuilt binary works, so you can ignore the message.

</details>

<details>
<summary><b>Peer dependency warnings after upgrading Prisma</b></summary>

Prisma is pinned to `7.10.1` on purpose: `prisma@latest` currently points to an 8.0 release candidate that brings incompatible tooling. Upgrade `prisma`, `@prisma/client` and `@prisma/adapter-pg` together, all to the same stable version.

</details>

<details>
<summary><b>A <code>new:*</code> command says the port is already used</b></summary>

Another app's `dev` script or `.env.example` already uses that port. Pass a different one with `--port <n>`, or leave out `--port` to get the next free one automatically.

</details>

## Maintaining the templates

`create-turbo` copies only the folder you choose, so each template is a complete, standalone repo. The two differ only in:

- `packages/database/`
- `apps/web/app/api/health/route.ts`
- `turbo.json` and the root `package.json` (Drizzle has no `db:generate` step)
- `README.md`

Everything else, including `scripts/`, is identical. Make shared changes in **both** folders, then check each one before pushing:

```sh
cd with-prisma   # then repeat in with-drizzle
bun install
bun run format:check && bun run lint && bun run check-types && bun run build
```

---

<p align="center">
  Built on the official <a href="https://github.com/vercel/turborepo/tree/main/examples/with-tailwind">Turborepo with-tailwind example</a> · Badges by <a href="https://shieldcn.dev">shieldcn</a>
</p>

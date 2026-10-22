<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/graph.svg?title=Turborepo+Templates&subtitle=Next.js+%C2%B7+Tailwind+%C2%B7+Prisma+or+Drizzle+%C2%B7+oxlint+%C2%B7+oxfmt&logo=turborepo&mode=dark" />
    <img alt="Turborepo Templates — Next.js · Tailwind · Prisma or Drizzle · oxlint · oxfmt" src="https://shieldcn.dev/header/graph.svg?title=Turborepo+Templates&subtitle=Next.js+%C2%B7+Tailwind+%C2%B7+Prisma+or+Drizzle+%C2%B7+oxlint+%C2%B7+oxfmt&logo=turborepo&mode=light" />
  </picture>
</p>

<p align="center">
  Production-ready Turborepo starters for Bun. Pick your ORM with one flag; linting, formatting, Tailwind and CI are already wired up.
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

- [Why these templates](#why-these-templates)
- [Choose a template](#choose-a-template)
- [Quick start](#quick-start)
- [What's inside](#whats-inside)
- [Scripts](#scripts)
- [Database workflow](#database-workflow)
- [Linting and formatting](#linting-and-formatting)
- [Environment variables](#environment-variables)
- [Continuous integration](#continuous-integration)
- [Deployment](#deployment)
- [Extending the monorepo](#extending-the-monorepo)
- [Troubleshooting](#troubleshooting)
- [Maintaining the templates](#maintaining-the-templates)

## Why these templates

The official `create-turbo` examples ship with ESLint and Prettier and no database layer. These templates start from the official [`with-tailwind`](https://github.com/vercel/turborepo/tree/main/examples/with-tailwind) example and replace or add the parts you'd otherwise set up by hand in every project:

| Feature           | Official example     | These templates                                                   |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| Linting           | ESLint (per package) | **oxlint**, one config at the root                                |
| Formatting        | Prettier             | **oxfmt**, with Tailwind class sorting                            |
| Database          | none                 | **Prisma 7** or **Drizzle**, as a shared `@repo/database` package |
| Local Postgres    | none                 | `docker-compose.yml` with a health check                          |
| Health check      | none                 | `GET /api/health` that checks the database connection             |
| CI                | none                 | GitHub Actions: format → lint → type-check → build                |
| Environment files | none                 | `.env.example` files, `.env` ignored by git                       |

Every template is verified end to end: generated with `create-turbo`, installed, linted, format-checked, type-checked, built, then migrated and seeded against a real Postgres. The health route returns `200` with the database up and `503` with it down.

## Choose a template

| Template                         | ORM                                                         | Choose it when                                                                         |
| -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`with-prisma`](./with-prisma)   | Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`) | You want a schema language, generated types, Prisma Studio and a mature migration workflow |
| [`with-drizzle`](./with-drizzle) | Drizzle ORM 0.45 + drizzle-kit (node-postgres)              | You want SQL-like TypeScript queries, no code generation step and plain SQL migrations |

Apart from the ORM, both templates are identical: same apps, same UI package, same tooling.

## Quick start

### 1. Create a project

```sh
# Prisma
bunx create-turbo@latest my-app -m bun \
  -e https://github.com/Yaswanth6303/turborepo-templates/tree/main/with-prisma

# Drizzle
bunx create-turbo@latest my-app -m bun \
  -e https://github.com/Yaswanth6303/turborepo-templates/tree/main/with-drizzle
```

`create-turbo` copies the chosen folder, installs dependencies and makes an initial git commit.

> [!NOTE]
> The root `package.json` keeps the template name (`with-prisma` / `with-drizzle`). Rename it to your project name.

### 2. Configure the environment

```sh
cd my-app
cp .env.example .env
cp .env.example packages/database/.env
cp .env.example apps/web/.env
```

### 3. Start Postgres and run the first migration

```sh
docker compose up -d     # Postgres 17 on localhost:5432
bun run db:migrate       # create and apply the initial migration
bun run db:seed          # optional: insert a demo user
```

### 4. Run the apps

```sh
bun run dev
```

| App    | URL                                |
| ------ | ---------------------------------- |
| `web`  | <http://localhost:3001>            |
| `docs` | <http://localhost:3000>            |
| Health | <http://localhost:3001/api/health> |

A healthy setup returns:

```json
{ "status": "ok", "database": "up" }
```

## What's inside

```text
my-app/
├── apps/
│   ├── web/                     # Next.js 16 app (port 3001), uses @repo/database
│   │   └── app/api/health/      # GET /api/health → checks the database
│   └── docs/                    # Next.js 16 app (port 3000)
├── packages/
│   ├── database/                # @repo/database — Prisma or Drizzle client + schema
│   ├── ui/                      # @repo/ui — shared React components (Tailwind, `ui:` prefix)
│   ├── tailwind-config/         # @repo/tailwind-config — shared theme + PostCSS config
│   └── typescript-config/       # @repo/typescript-config — shared tsconfig presets
├── scripts/new-app.mjs          # `bun run new:app <name>` scaffolder
├── .github/workflows/ci.yml     # format → lint → type-check → build
├── .oxlintrc.json               # oxlint config (TypeScript, React, Next.js, import rules)
├── .oxfmtrc.json                # oxfmt config (Tailwind class sorting)
├── docker-compose.yml           # local Postgres 17
├── .env.example
└── turbo.json
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
    ├── client.ts     # PrismaClient singleton
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
    ├── client.ts     # Pool + drizzle singleton
    ├── seed.ts
    └── index.ts      # exports db, schema, operators
```

</td>
</tr>
</table>

Both clients reuse a single connection across Next.js hot reloads, so development doesn't exhaust Postgres connections.

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
| Node       | ≥ 24 (engines)                     |

## Scripts

Run everything from the repo root.

| Command                | Description                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `bun run dev`          | Start all apps in watch mode                                                                   |
| `bun run build`        | Production build of every app and package                                                      |
| `bun run check-types`  | Type-check the whole monorepo                                                                  |
| `bun run lint`         | Run oxlint (fails on any warning)                                                              |
| `bun run lint:fix`     | Run oxlint with auto-fix                                                                       |
| `bun run format`       | Format everything with oxfmt                                                                   |
| `bun run format:check` | Check formatting without writing (used in CI)                                                  |
| `bun run new:app <name>` | Add a Next.js app in `apps/` wired to the shared config ([details](#add-a-new-app))          |
| `bun run db:migrate`   | Create and apply a migration (development)                                                     |
| `bun run db:deploy`    | Apply pending migrations (production)                                                          |
| `bun run db:push`      | Push the schema without creating a migration (prototyping only)                                |
| `bun run db:seed`      | Seed the database                                                                              |
| `bun run db:studio`    | Open Prisma Studio / Drizzle Studio                                                            |
| `bun run db:generate`  | **Prisma only:** generate the client (runs automatically before `dev`, `build` and `check-types`) |

## Database workflow

### Using the database in an app

Add the dependency to the app's `package.json`:

```json
{ "dependencies": { "@repo/database": "*" } }
```

Then import it **from server code only** (route handlers, server components, server actions):

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

### Changing the schema

| Step               | with-prisma                               | with-drizzle                                              |
| ------------------ | ----------------------------------------- | --------------------------------------------------------- |
| 1. Edit the schema | `packages/database/prisma/schema.prisma`  | `packages/database/src/schema.ts`                         |
| 2. Create + apply  | `bun run db:migrate` (prompts for a name) | `bun run db:migrate` (`drizzle-kit generate` + `migrate`) |
| 3. Commit          | `packages/database/prisma/migrations/`    | `packages/database/drizzle/`                              |
| 4. Production      | `bun run db:deploy`                       | `bun run db:deploy`                                       |

> [!TIP]
> Use `bun run db:push` only for throwaway prototyping. It changes the database without creating a migration file, so production can't replay it.

## Linting and formatting

Both tools are written in Rust and run across the whole monorepo in milliseconds, so they run once from the root instead of per package.

### oxlint (`.oxlintrc.json`)

- Plugins: `typescript`, `react`, `nextjs`, `unicorn`, `oxc`, `import`
- `correctness` rules are errors, `suspicious` rules are warnings
- `bun run lint` uses `--max-warnings 0`, so warnings fail CI too
- Ignores `.next`, `dist`, the generated Prisma client and Drizzle migrations

### oxfmt (`.oxfmtrc.json`)

- Prettier-compatible output (80 columns, double quotes, trailing commas)
- Sorts Tailwind classes in `className`, `cn()`, `clsx()` and `cva()` using the shared theme in `packages/tailwind-config/shared-styles.css`. It's the same algorithm as `prettier-plugin-tailwindcss`.

### Editor setup (VS Code)

Install the [oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": { "source.fixAll.oxc": "explicit" }
}
```

## Environment variables

| Variable       | Used by                                         | Example                                             |
| -------------- | ----------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL` | `packages/database` (CLI), `apps/web` (runtime) | `postgresql://postgres:postgres@localhost:5432/app` |

- Next.js reads `apps/web/.env`. The Prisma and Drizzle CLIs read `packages/database/.env`.
- Turborepo runs in strict env mode, and `DATABASE_URL` is declared in `turbo.json` for every task that needs it. **Declare any new variable there too**, or it won't reach the task and won't affect caching.
- `.env` files are git-ignored. Only commit `.env.example`.

## Continuous integration

Every generated project includes `.github/workflows/ci.yml`, which runs on pushes to `main` and on pull requests:

```text
bun install --frozen-lockfile → format:check → lint → check-types → build
```

The build uses a placeholder `DATABASE_URL`. No database is contacted, because the `/api/health` route is dynamic and only connects at request time.

## Deployment

1. Set `DATABASE_URL` in your hosting provider (Vercel, Railway, Fly.io, a VPS…).
2. Run `bun run db:deploy` before each release, either as a release step or in your pipeline.
3. Build with `bun run build`. On Vercel, set the project's root directory to `apps/web`.
4. Use a managed Postgres in production. `docker-compose.yml` is for local development only.

> [!IMPORTANT]
> On serverless platforms, use a pooled connection string as `DATABASE_URL` (for example Neon's pooled URL, Supabase's pooler or PgBouncer). Otherwise each function invocation opens a new direct connection.

## Extending the monorepo

### Add a new app

```sh
bun run new:app admin          # Next.js app on the next free port
bun run new:app admin --db     # …that also uses @repo/database
bun run new:app admin --port 4000
```

`new:app` creates `apps/<name>` from the template's own app config, so it has **no ESLint or Prettier** and uses the root oxlint/oxfmt, `@repo/typescript-config`, `@repo/tailwind-config` and `@repo/ui`. It then installs with your package manager (bun, pnpm, npm or nub, detected from `package.json` or the lockfile) and formats the new files.

| Option          | Effect                                                                      |
| --------------- | --------------------------------------------------------------------------- |
| `--db`          | Adds `@repo/database` and an `.env.example`                                 |
| `--port <n>`    | Dev server port (default: one above the highest port used by existing apps) |

It refuses invalid names, existing apps and ports already in use. Start the new app on its own with `bun run dev --filter=admin`.

> [!TIP]
> Avoid `create-next-app` inside `apps/`: it adds its own ESLint config and dependencies that this monorepo doesn't use.

### Add a Node.js app (TypeScript or JavaScript)

For APIs, workers or an Express/Fastify/Hono server:

```sh
bun run new:ts-app api          # TypeScript
bun run new:js-app worker       # JavaScript
bun run new:ts-app api --db     # …that also uses @repo/database
```

Each app gets a minimal `node:http` server with `GET /health`, a `.env.example` (with `PORT` and, with `--db`, `DATABASE_URL`) and graceful shutdown on `SIGINT`/`SIGTERM`:

| Script  | What it runs                                                                              |
| ------- | ----------------------------------------------------------------------------------------- |
| `dev`   | `tsx watch` (runs TypeScript directly, reloads on change, loads `.env`)                   |
| `build` | `tsup` → `dist/index.js` (bundles `@repo/*` workspace code; npm dependencies stay external) |
| `start` | `node dist/index.js` (loads `.env` if present)                                            |
| `check-types` | `tsc --noEmit` (TypeScript apps only)                                               |

With `--db`, `/health` runs `SELECT 1` through Prisma or Drizzle (whichever the template uses) and returns `503` while the database is unreachable. Add a framework with `bun add express --filter=api`.

### Add a React app (Vite+)

For a client-side React single-page app (dashboard, admin panel, widget) built with [Vite+](https://viteplus.dev):

```sh
bun run new:react-app dashboard
bun run new:react-app dashboard --port 4000
```

The app uses React 19, Tailwind CSS 4 (`@tailwindcss/vite`) and `@repo/ui`, the same versions as the Next.js apps:

| Script        | What it runs                                    |
| ------------- | ----------------------------------------------- |
| `dev`         | `vp dev` (dev server with HMR)                  |
| `build`       | `vp build` → static files in `dist/`            |
| `preview`     | `vp preview` (serve the production build)       |
| `test`        | `vp test` (Vitest; import from `vite-plus/test`) |
| `check-types` | `tsc --noEmit`                                  |

Notes:

- **Lint and format stay at the root.** The app's `vite.config.ts` has no `lint`/`fmt` blocks and `vp check` isn't used, so oxlint and oxfmt behave exactly as for every other app.
- The first React app adds a root `overrides` entry (`vite` → `@voidzero-dev/vite-plus-core`) so Vite plugins resolve to the Vite+ core. With pnpm it goes under `pnpm.overrides`.
- It's a browser app: don't import `@repo/database`. Call one of your APIs (e.g. a `new:ts-app` server or a Next.js route handler) instead. Expose config with `VITE_`-prefixed env vars.

### Add a new package

Create `packages/<name>/package.json` with a `@repo/<name>` name and an `exports` field pointing at `./src/index.ts`. Next.js compiles workspace TypeScript packages directly, so no build step is needed.

## Troubleshooting

<details>
<summary><b>Port 5432 is already in use</b></summary>

Another Postgres (or an SSH tunnel) is already using port 5432. Change the host port in `docker-compose.yml` (e.g. `"5433:5432"`) and update `DATABASE_URL` to use `localhost:5433`.

</details>

<details>
<summary><b><code>bun install</code> says "Blocked 1 postinstall"</b></summary>

That's `@parcel/watcher`, a dependency of `@tailwindcss/cli`. Its install script only builds from source as a fallback. A prebuilt binary is used instead, so you can ignore the message.

</details>

<details>
<summary><b>Peer dependency warnings after upgrading Prisma</b></summary>

Prisma is pinned to `7.10.1` on purpose: `prisma@latest` currently points to an 8.0 release candidate that pulls in incompatible tooling. When you upgrade, move `prisma`, `@prisma/client` and `@prisma/adapter-pg` together to the same stable version.

</details>

<details>
<summary><b><code>Cannot find module './generated/prisma/client'</code></b></summary>

The Prisma client hasn't been generated yet. Run `bun run db:generate`. It also runs automatically before `dev`, `build` and `check-types`.

</details>

<details>
<summary><b>An environment variable is <code>undefined</code> inside a task</b></summary>

Turborepo's strict env mode filters out variables that aren't declared. Add the variable to the task's `env` array in `turbo.json`.

</details>

## Maintaining the templates

`create-turbo` copies only the chosen folder, so each template is fully standalone. The two differ only in:

- `packages/database/`
- `apps/web/app/api/health/route.ts`
- `turbo.json` and the root `package.json` (Drizzle has no `db:generate` step)
- `README.md`

Apply every other change to **both** folders, then verify each one before pushing:

```sh
cd with-prisma   # then with-drizzle
bun install
bun run format:check && bun run lint && bun run check-types && bun run build
```

---

<p align="center">
  Built on the official <a href="https://github.com/vercel/turborepo/tree/main/examples/with-tailwind">Turborepo with-tailwind example</a> · Badges by <a href="https://shieldcn.dev">shieldcn</a>
</p>

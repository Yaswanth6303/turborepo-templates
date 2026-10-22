# Turborepo starter templates

Two production-ready Turborepo starters. Both ship with:

- **Next.js 16** apps (`web`, `docs`) and a shared React **UI** package
- **Tailwind CSS 4** with a shared theme package
- **oxlint** (linting) and **oxfmt** (formatting, with Tailwind class sorting), with no ESLint or Prettier
- **Postgres** via Docker Compose for local development
- A `@repo/database` package, plus a `/api/health` route that checks the DB connection
- GitHub Actions CI: format check → lint → type-check → build

| Template        | ORM                                       |
| --------------- | ----------------------------------------- |
| `with-prisma/`  | Prisma 7 (`prisma-client` + `adapter-pg`) |
| `with-drizzle/` | Drizzle ORM + drizzle-kit (node-postgres) |

## Create a new project

Push this folder to GitHub (e.g. `github.com/<you>/turbo-templates`), then pick the ORM with `-e`:

```sh
# Prisma
bunx create-turbo@latest my-app -m bun \
  -e https://github.com/<you>/turbo-templates/tree/main/with-prisma

# Drizzle
bunx create-turbo@latest my-app -m bun \
  -e https://github.com/<you>/turbo-templates/tree/main/with-drizzle
```

Then follow the generated project's `README.md` (copy `.env.example`, `docker compose up -d`, `bun run db:migrate`, `bun run dev`).

## Maintaining the templates

The two folders are intentionally standalone (create-turbo copies only the chosen folder). Apart from `packages/database`, `apps/web/app/api/health/route.ts`, `turbo.json` (Drizzle has no `db:generate` step) and the READMEs, they are identical. Apply shared changes to both.

Verify a template before pushing:

```sh
cd with-prisma   # or with-drizzle
bun install
bun run format:check && bun run lint && bun run check-types && bun run build
```

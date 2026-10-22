#!/usr/bin/env node
// Scaffold a new Node.js backend app (API, worker, Express server, …) in apps/<name>,
// wired to the shared config: root oxlint/oxfmt (no ESLint/Prettier) and, for TypeScript,
// @repo/typescript-config. Dev runs with tsx; `build` bundles to dist/ with tsup.
//
// Usage: bun run new:ts-app <name> [--db] [--port <number>]
//        bun run new:js-app <name> [--db] [--port <number>]
//   --db      use @repo/database (adds a /health database check and DATABASE_URL)
//   --port    server port (default: next free port after existing apps)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import {
  detectOrm,
  fail,
  installAndFormat,
  pickPort,
  readJson,
  root,
  toTitle,
  validateAppName,
} from "./lib/scaffold.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    lang: { type: "string", default: "ts" },
    db: { type: "boolean", default: false },
    port: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

const ts = values.lang === "ts";
if (!ts && values.lang !== "js")
  fail(`Unknown --lang "${values.lang}". Use ts or js.`);

const usage = `Usage: bun run new:${values.lang}-app <name> [--db] [--port <number>]`;
if (values.help) {
  console.log(usage);
  process.exit(0);
}

const [name] = positionals;
const appDir = validateAppName(name, usage);
const port = pickPort(values.port);
const ext = ts ? "ts" : "js";
const write = (file, content) => writeFileSync(join(appDir, file), content);

mkdirSync(join(appDir, "src"), { recursive: true });

// ---------------------------------------
// package.json
// ---------------------------------------
// With --db, the ORM's runtime packages become direct dependencies: tsup bundles @repo/database
// but keeps these external, and strict installers (pnpm) only expose an app's own dependencies.
const databaseDeps = values.db
  ? readJson(join(root, "packages", "database", "package.json")).dependencies
  : {};

const pkg = {
  name,
  version: "1.0.0",
  type: "module",
  private: true,
  scripts: {
    dev: `tsx watch --env-file-if-exists=.env src/index.${ext}`,
    build: "tsup",
    start: "node --env-file-if-exists=.env dist/index.js",
    ...(ts && { "check-types": "tsc --noEmit" }),
  },
  ...(values.db && {
    dependencies: { "@repo/database": "*", ...databaseDeps },
  }),
  devDependencies: {
    ...(ts && { "@repo/typescript-config": "*" }),
    "@types/node": "26.6.3",
    tsup: "9.0.0",
    tsx: "4.23.15",
    ...(ts && { typescript: "7.0.2" }),
  },
};
write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

// ---------------------------------------
// Config files
// ---------------------------------------
write(
  `tsup.config.${ext}`,
  `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.${ext}"],
  format: ["esm"],
  platform: "node",
  target: "node24",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Workspace packages ship TypeScript source, so bundle them; npm dependencies stay external.
  noExternal: [/^@repo\\//],
});
`,
);

if (ts) {
  write(
    "tsconfig.json",
    `${JSON.stringify(
      {
        extends: "@repo/typescript-config/base.json",
        compilerOptions: {
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          types: ["node"],
        },
        include: ["src", "tsup.config.ts"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2,
    )}\n`,
  );
}

write(".gitignore", "node_modules\ndist\n.env\n");
write(
  ".env.example",
  `PORT=${port}\n${values.db ? 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"\n' : ""}`,
);

// ---------------------------------------
// src/index
// ---------------------------------------
const orm = values.db ? detectOrm() : null;
const dbImport =
  {
    prisma: 'import { prisma } from "@repo/database";\n',
    drizzle: 'import { db, sql } from "@repo/database";\n',
  }[orm] ?? "";
const dbCheck = {
  prisma: "await prisma.$queryRaw`SELECT 1`;",
  drizzle: "await db.execute(sql`SELECT 1`);",
}[orm];

const healthHandler = values.db
  ? `  if (req.url === "/health") {
    try {
      ${dbCheck}
      return send(res, 200, { status: "ok", database: "up" });
    } catch (error) {
      console.error("Health check failed", error);
      return send(res, 503, { status: "error", database: "down" });
    }
  }`
  : `  if (req.url === "/health") return send(res, 200, { status: "ok" });`;

const responseType = ts ? ': import("node:http").ServerResponse' : "";
const statusType = ts ? ": number" : "";
const bodyType = ts ? ": unknown" : "";

write(
  `src/index.${ext}`,
  `import { createServer } from "node:http";
${dbImport}
const port = Number(process.env.PORT ?? ${port});

const send = (res${responseType}, status${statusType}, body${bodyType}) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

const server = createServer(async (req, res) => {
${healthHandler}
  return send(res, 200, { message: "Hello from ${name}" });
});

server.listen(port, () => {
  process.stdout.write(\`${name} listening on http://localhost:\${port}\\n\`);
});

// Close open connections on shutdown so containers and process managers stop cleanly.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
`,
);

const title = toTitle(name);
write(
  "README.md",
  `# ${title}

Node.js ${ts ? "TypeScript" : "JavaScript"} app in the monorepo, using the shared oxlint/oxfmt config.

\`\`\`sh
cp .env.example .env
bun run dev --filter=${name}     # http://localhost:${port} (watch mode via tsx)
bun run build --filter=${name}   # bundle to dist/ with tsup
\`\`\`

Run the build with \`node --env-file-if-exists=.env dist/index.js\` (the \`start\` script).
Add a framework with e.g. \`bun add express --filter=${name}\`.
${values.db ? "\nUses `@repo/database`; `GET /health` checks the database connection.\n" : ""}`,
);

console.log(
  `Created apps/${name} (${ts ? "TypeScript" : "JavaScript"}, port ${port}${values.db ? `, with @repo/database (${orm})` : ""})`,
);
installAndFormat(name);

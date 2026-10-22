#!/usr/bin/env node
// Scaffold a new Next.js app in apps/<name>, wired to the shared config:
// root oxlint/oxfmt (no ESLint/Prettier), @repo/typescript-config, @repo/tailwind-config, @repo/ui.
//
// Usage: bun run new:next-app <name> [--db] [--port <number>]
//   --db      also depend on @repo/database and add apps/<name>/.env.example
//   --port    dev server port (default: next free port after existing apps)

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import {
  appsDir,
  fail,
  installAndFormat,
  pickPort,
  readJson,
  toTitle,
  validateAppName,
} from "./lib/scaffold.mjs";

const usage = "Usage: bun run new:next-app <name> [--db] [--port <number>]";
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    db: { type: "boolean", default: false },
    port: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});
if (values.help) {
  console.log(usage);
  process.exit(0);
}

const [name] = positionals;
const appDir = validateAppName(name, usage);
const source = join(appsDir, "docs");
if (!existsSync(source))
  fail("apps/docs is missing; it is used as the base for new Next.js apps.");
const port = pickPort(values.port);
const title = toTitle(name);

// Copy the base app (config only, no demo content)
mkdirSync(join(appDir, "app"), { recursive: true });
for (const file of [
  ".gitignore",
  "next-env.d.ts",
  "next.config.ts",
  "postcss.config.js",
  "tsconfig.json",
  "app/globals.css",
  "app/favicon.ico",
]) {
  cpSync(join(source, file), join(appDir, file));
}

const sourcePkg = readJson(join(source, "package.json"));
const pkg = {
  ...sourcePkg,
  name,
  scripts: {
    ...sourcePkg.scripts,
    dev: `next dev --port ${port}`,
    start: `next start --port ${port}`,
  },
  dependencies: {
    ...sourcePkg.dependencies,
    ...(values.db && { "@repo/database": "*" }),
  },
};
writeFileSync(
  join(appDir, "package.json"),
  `${JSON.stringify(pkg, null, 2)}\n`,
);

const layout = readFileSync(join(source, "app/layout.tsx"), "utf8").replace(
  /title: "[^"]*"/,
  `title: ${JSON.stringify(title)}`,
);
writeFileSync(join(appDir, "app/layout.tsx"), layout);

writeFileSync(
  join(appDir, "app/page.tsx"),
  `export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl font-bold">${title}</h1>
      <p>
        Edit <code className="font-mono font-bold">apps/${name}/app/page.tsx</code> to get started.
      </p>
    </main>
  );
}
`,
);

if (values.db) {
  const envExample = join(appsDir, "web", ".env.example");
  if (existsSync(envExample)) cpSync(envExample, join(appDir, ".env.example"));
}

writeFileSync(
  join(appDir, "README.md"),
  `# ${title}

Next.js app in the monorepo, using the shared oxlint/oxfmt, TypeScript and Tailwind config.

\`\`\`sh
bun run dev --filter=${name}   # http://localhost:${port}
\`\`\`
${values.db ? `\nUses \`@repo/database\`: copy \`.env.example\` to \`.env\` and import it from server code only.\n` : ""}`,
);

console.log(
  `Created apps/${name} (Next.js, port ${port}${values.db ? ", with @repo/database" : ""})`,
);
installAndFormat(name);

#!/usr/bin/env node
// Scaffold a new Next.js app in apps/<name>, wired to the shared config:
// root oxlint/oxfmt (no ESLint/Prettier), @repo/typescript-config, @repo/tailwind-config, @repo/ui.
//
// Usage: bun run new:app <name> [--db] [--port <number>]
//   --db      also depend on @repo/database and add apps/<name>/.env.example
//   --port    dev server port (default: next free port after existing apps)

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appsDir = join(root, "apps");
const source = join(appsDir, "docs");

const fail = (message) => {
  console.error(`\n${message}`);
  process.exit(1);
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    db: { type: "boolean", default: false },
    port: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

const usage = "Usage: bun run new:app <name> [--db] [--port <number>]";
if (values.help) {
  console.log(usage);
  process.exit(0);
}

const [name] = positionals;
if (!name) fail(usage);
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  fail(
    `Invalid app name "${name}". Use lowercase letters, numbers and dashes, starting with a letter.`,
  );
}

const appDir = join(appsDir, name);
if (existsSync(appDir)) fail(`apps/${name} already exists.`);
if (!existsSync(source))
  fail("apps/docs is missing; it is used as the base for new apps.");

const workspaces = readdirSync(appsDir, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      existsSync(join(appsDir, entry.name, "package.json")),
  )
  .map((entry) =>
    JSON.parse(readFileSync(join(appsDir, entry.name, "package.json"), "utf8")),
  );

if (workspaces.some((pkg) => pkg.name === name))
  fail(`A workspace named "${name}" already exists.`);

// Port: explicit, or one above the highest `--port` used by existing apps.
const usedPorts = workspaces
  .map((pkg) => Number(pkg.scripts?.dev?.match(/--port\s+(\d+)/)?.[1]))
  .filter(Number.isInteger);
const port = values.port
  ? Number(values.port)
  : Math.max(2999, ...usedPorts) + 1;
if (!Number.isInteger(port) || port < 1 || port > 65535)
  fail(`Invalid port "${values.port}".`);
if (usedPorts.includes(port))
  fail(`Port ${port} is already used by another app.`);

// ---------------------------------------
// Copy the base app (config only, no demo content)
// ---------------------------------------
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

const sourcePkg = JSON.parse(
  readFileSync(join(source, "package.json"), "utf8"),
);
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

const title = name.replace(
  /(^|-)(\w)/g,
  (_, dash, char) => `${dash ? " " : ""}${char.toUpperCase()}`,
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
  `Created apps/${name} (port ${port}${values.db ? ", with @repo/database" : ""})`,
);

// ---------------------------------------
// Install with the project's package manager, then format the new files
// ---------------------------------------
const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const lockfiles = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["package-lock.json", "npm"],
];
const packageManager =
  (rootPkg.packageManager ?? rootPkg.devEngines?.packageManager?.name ?? "")
    .split("@")[0]
    .trim() ||
  lockfiles.find(([file]) => existsSync(join(root, file)))?.[1] ||
  "bun";

const run = (command, args) => {
  const { status, error } = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (error || status !== 0)
    fail(
      `Failed: ${command} ${args.join(" ")}${error ? ` (${error.message})` : ""}`,
    );
};

console.log(`Installing with ${packageManager}...`);
run(packageManager, ["install"]);
run(join(root, "node_modules", ".bin", "oxfmt"), [join("apps", name)]);

const filterArg =
  packageManager === "npm" ? `-- --filter=${name}` : `--filter=${name}`;
console.log(`\nDone. Start it with: ${packageManager} run dev ${filterArg}`);

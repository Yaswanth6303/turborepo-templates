// Shared helpers for the new:*-app scaffolding scripts.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const appsDir = join(root, "apps");

export const fail = (message) => {
  console.error(`\n${message}`);
  process.exit(1);
};

export const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

// Validate the app name and make sure neither the folder nor the workspace name is taken.
export const validateAppName = (name, usage) => {
  if (!name) fail(usage);
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    fail(
      `Invalid app name "${name}". Use lowercase letters, numbers and dashes, starting with a letter.`,
    );
  }
  if (existsSync(join(appsDir, name))) fail(`apps/${name} already exists.`);
  const taken = listApps().some(
    (app) => readJson(join(app, "package.json")).name === name,
  );
  if (taken) fail(`A workspace named "${name}" already exists.`);
  return join(appsDir, name);
};

const listApps = () =>
  readdirSync(appsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(appsDir, entry.name))
    .filter((dir) => existsSync(join(dir, "package.json")));

// Ports used by existing apps: Next.js `--port N` in the dev script, or PORT=N in .env.example.
const usedPorts = () =>
  listApps()
    .flatMap((dir) => {
      const dev = readJson(join(dir, "package.json")).scripts?.dev ?? "";
      const env = existsSync(join(dir, ".env.example"))
        ? readFileSync(join(dir, ".env.example"), "utf8")
        : "";
      return [dev.match(/--port\s+(\d+)/)?.[1], env.match(/^PORT=(\d+)/m)?.[1]];
    })
    .map(Number)
    .filter(Number.isInteger);

// Explicit --port, or one above the highest port used by existing apps.
export const pickPort = (requested) => {
  const used = usedPorts();
  const port = requested ? Number(requested) : Math.max(2999, ...used) + 1;
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    fail(`Invalid port "${requested}".`);
  if (used.includes(port)) fail(`Port ${port} is already used by another app.`);
  return port;
};

export const toTitle = (name) =>
  name.replace(
    /(^|-)(\w)/g,
    (_, dash, char) => `${dash ? " " : ""}${char.toUpperCase()}`,
  );

// Declared package manager wins (the only way to spot nub, which reuses other tools' lockfiles),
// then the lockfile, then bun.
export const detectPackageManager = () => {
  const pkg = readJson(join(root, "package.json"));
  const declared = (
    pkg.packageManager ??
    pkg.devEngines?.packageManager?.name ??
    ""
  )
    .split("@")[0]
    .trim();
  const lockfiles = [
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["package-lock.json", "npm"],
  ];
  return (
    declared ||
    lockfiles.find(([file]) => existsSync(join(root, file)))?.[1] ||
    "bun"
  );
};

const run = (command, args) => {
  const { status, error } = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (error || status !== 0) {
    fail(
      `Failed: ${command} ${args.join(" ")}${error ? ` (${error.message})` : ""}`,
    );
  }
};

// Install with the project's package manager, format only the new app, print how to start it.
export const installAndFormat = (name) => {
  const packageManager = detectPackageManager();
  console.log(`Installing with ${packageManager}...`);
  run(packageManager, ["install"]);
  run(join(root, "node_modules", ".bin", "oxfmt"), [join("apps", name)]);
  const filterArg =
    packageManager === "npm" ? `-- --filter=${name}` : `--filter=${name}`;
  console.log(`\nDone. Start it with: ${packageManager} run dev ${filterArg}`);
};

// Which ORM packages/database uses, so generated code matches it.
export const detectOrm = () =>
  existsSync(join(root, "packages", "database", "prisma"))
    ? "prisma"
    : "drizzle";

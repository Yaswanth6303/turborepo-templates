#!/usr/bin/env node
// Scaffold a new React + TypeScript single-page app in apps/<name>, built with Vite+
// (https://viteplus.dev): `vp dev`, `vp build`, `vp preview`, `vp test`.
// Wired to the shared config: root oxlint/oxfmt (no ESLint/Prettier; lint and format run
// from the root, not `vp check`), @repo/typescript-config, @repo/tailwind-config, @repo/ui.
//
// Usage: bun run new:react-app <name> [--port <number>]
//   --port    dev/preview server port (default: next free port after existing apps)

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import {
  appsDir,
  detectPackageManager,
  fail,
  installAndFormat,
  pickPort,
  readJson,
  root,
  toTitle,
  validateAppName,
} from "./lib/scaffold.mjs";

const VITE_PLUS_VERSION = "1.3.0";
const VITE_ALIAS = `npm:@voidzero-dev/vite-plus-core@${VITE_PLUS_VERSION}`;

const usage = "Usage: bun run new:react-app <name> [--port <number>]";
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: "string" },
    // Accepted only to explain why it isn't supported.
    db: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});
if (values.help) {
  console.log(usage);
  process.exit(0);
}
if (values.db) {
  fail(
    "React apps run in the browser and can't use @repo/database. Create an API with `new:ts-app <name> --db` (or a Next.js route handler) and fetch from it.",
  );
}

const [name] = positionals;
const appDir = validateAppName(name, usage);
const port = pickPort(values.port);
const title = toTitle(name);
const write = (file, content) => writeFileSync(join(appDir, file), content);

mkdirSync(join(appDir, "src"), { recursive: true });
mkdirSync(join(appDir, "public"), { recursive: true });

// Reuse the versions the Next.js apps already use, so the monorepo stays on one React/Tailwind.
const docsPkg = readJson(join(appsDir, "docs", "package.json"));
const version = (dep) =>
  docsPkg.dependencies?.[dep] ?? docsPkg.devDependencies?.[dep] ?? "latest";

const pkg = {
  name,
  version: "1.0.0",
  type: "module",
  private: true,
  scripts: {
    dev: `vp dev --port ${port} --strictPort`,
    build: "vp build",
    preview: `vp preview --port ${port} --strictPort`,
    test: "vp test --passWithNoTests",
    "check-types": "tsc --noEmit",
  },
  dependencies: {
    "@repo/ui": "*",
    react: version("react"),
    "react-dom": version("react-dom"),
  },
  devDependencies: {
    "@repo/tailwind-config": "*",
    "@repo/typescript-config": "*",
    "@tailwindcss/vite": version("tailwindcss"),
    "@types/react": version("@types/react"),
    "@types/react-dom": version("@types/react-dom"),
    "@vitejs/plugin-react": "6.1.2",
    tailwindcss: version("tailwindcss"),
    typescript: version("typescript"),
    vite: VITE_ALIAS,
    "vite-plus": VITE_PLUS_VERSION,
  },
};
write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

write(
  "vite.config.ts",
  `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

// Lint and format run from the repo root with oxlint/oxfmt, so no \`lint\`/\`fmt\` blocks here.
export default defineConfig({
  plugins: lazyPlugins(() => [react(), tailwindcss()]),
});
`,
);

write(
  "tsconfig.json",
  `${JSON.stringify(
    {
      extends: "@repo/typescript-config/base.json",
      compilerOptions: {
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        noEmit: true,
        declaration: false,
        declarationMap: false,
        types: ["vite/client"],
      },
      include: ["src", "vite.config.ts"],
      exclude: ["node_modules", "dist"],
    },
    null,
    2,
  )}\n`,
);

write(
  "index.html",
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
);

cpSync(
  join(appsDir, "docs", "app", "favicon.ico"),
  join(appDir, "public", "favicon.ico"),
);

write(
  "src/main.tsx",
  `import "@repo/ui/styles.css";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element in index.html");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
);

write(
  "src/app.tsx",
  `import { Card } from "@repo/ui/card";

export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-24">
      <h1 className="text-4xl font-bold">${title}</h1>
      <p>
        Edit <code className="font-mono font-bold">apps/${name}/src/app.tsx</code> to get started.
      </p>
      <Card title="Vite+" href="https://viteplus.dev/guide/">
        The toolchain behind this app: vp dev, vp build, vp test.
      </Card>
    </main>
  );
}
`,
);

write(
  "src/index.css",
  '@import "tailwindcss";\n@import "@repo/tailwind-config";\n',
);
write(".gitignore", "node_modules\ndist\n.env\n.env.local\n");

write(
  "README.md",
  `# ${title}

React + TypeScript single-page app built with [Vite+](https://viteplus.dev), using the shared oxlint/oxfmt, TypeScript, Tailwind and UI packages.

\`\`\`sh
bun run dev --filter=${name}     # http://localhost:${port}
bun run build --filter=${name}   # production build in dist/
\`\`\`

Inside \`apps/${name}\`: \`vp preview\` serves the build, \`vp test\` runs Vitest.
Expose environment variables to the browser with the \`VITE_\` prefix (\`import.meta.env.VITE_API_URL\`).
`,
);

// ---------------------------------------
// Root override: every package that depends on `vite` (plugins) must get the Vite+ core.
// ---------------------------------------
const rootPkgPath = join(root, "package.json");
const rootPkg = readJson(rootPkgPath);
const packageManager = detectPackageManager();
const overrides =
  packageManager === "pnpm"
    ? ((rootPkg.pnpm ??= {}).overrides ?? (rootPkg.pnpm.overrides = {}))
    : (rootPkg.overrides ??= {});
if (overrides.vite !== VITE_ALIAS) {
  overrides.vite = VITE_ALIAS;
  writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);
  console.log(`Added root override: vite -> ${VITE_ALIAS}`);
}

console.log(`Created apps/${name} (React + Vite+, port ${port})`);
installAndFormat(name);

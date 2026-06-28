import { defineConfig } from "vite-plus";
import { vitePlusPackage } from "./src/vite-plus.js";
import { vitestNode } from "./src/vitest.js";

// Dogfood the package's own helpers to power the whole vite-plus toolchain:
// `vp pack` (build), `vp lint`, `vp fmt`, `vp test`, `vp check`, `vp staged`.
export default defineConfig({
  ...vitePlusPackage({
    lint: { typeAware: true, typeCheck: true },
    pack: {
      // Override the helper's experimental `dts: { tsgo: true }` default, which
      // requires @typescript/native-preview. Use the bundled rolldown dts path.
      dts: true,
      entry: ["src/index.ts", "src/oxlint.ts", "src/vitest.ts", "src/vite-plus.ts", "src/vite.ts"],
      // Keep the hand-maintained exports map: auto-gen drops `types` conditions
      // and the static ./tsconfig/*.json preset exports that tsdown can't see.
      exports: false,
    },
  }),
  ...vitestNode(),
  // Explicit top-level staged block so `vp config` (run from `prepare`) doesn't
  // re-inject one. Scoped to source files so pre-commit `vp staged` skips configs
  // like .gitignore and the shell hooks. `vp staged` reads this on pre-commit.
  staged: { "*.{ts,tsx,js,json,md}": "vp check --fix" },
});

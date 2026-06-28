import { defineConfig } from "vite-plus";
import { vitePlusPackage } from "./src/vite-plus.js";
import { vitestNode } from "./src/vitest.js";

// Dogfood the package's own helpers to power the whole vite-plus toolchain:
// `vp pack` (build), `vp lint`, `vp fmt`, `vp test`, `vp check`, `vp staged`.
export default defineConfig({
  ...vitePlusPackage({
    lint: { typeAware: true, typeCheck: true },
    pack: {
      entry: [
        "src/index.ts",
        "src/oxlint.ts",
        "src/vitest.ts",
        "src/vite-plus.ts",
        "src/vite.ts",
        "src/package-json.ts",
      ],
      // Override the helper's experimental `dts: { tsgo: true }` default, which
      // requires @typescript/native-preview. Use the bundled rolldown dts path.
      dts: true,
      // Keep the hand-maintained exports map: auto-gen drops `types` conditions
      // and the static ./tsconfig/*.json preset exports that tsdown can't see.
      exports: false,
    },
  }),
  ...vitestNode(),
});

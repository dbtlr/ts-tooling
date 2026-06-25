import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/oxlint.ts",
    "src/vitest.ts",
    "src/vite-plus.ts",
    "src/vite.ts",
    "src/package-json.ts",
  ],
  dts: true,
  format: ["esm"],
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ["oxlint", "vite", "vite-plus", "vitest", "vitest/config"],
});

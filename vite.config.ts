import { defineConfig } from 'vite-plus';

import { fmt } from './src/fmt.js';
import { lint } from './src/lint.js';
import { pack } from './src/pack.js';
import { testNode } from './src/vitest.js';

// Dogfood the package's own helpers to power the whole vite-plus toolchain:
// `vp pack` (build), `vp lint`, `vp fmt`, `vp test`, `vp check`, `vp staged`.
export default defineConfig({
  fmt: fmt(),
  lint: lint({ ignores: ['examples'], node: true }),
  pack: pack({
    // Override the helper's experimental `dts: { tsgo: true }` default (needs
    // @typescript/native-preview). Use the bundled rolldown dts path.
    dts: true,
    entry: ['src/index.ts', 'src/setup/dom.ts'],
    // Keep the hand-maintained exports map: auto-gen drops `types` conditions
    // and the static ./tsconfig/*.json preset exports tsdown can't see.
    exports: false,
  }),
  // Explicit top-level staged block so `vp config` (run from `prepare`) doesn't
  // re-inject one. Scoped to source files so pre-commit `vp staged` skips configs.
  staged: { '*.{ts,tsx,js,json,md}': 'vp check --fix' },
  test: testNode(),
});

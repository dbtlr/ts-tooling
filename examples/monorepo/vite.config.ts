import { defineConfig, fmt, lint, testNode, testProjects, testReact } from '@dbtlr/tooling';
import react from '@vitejs/plugin-react';

// Composition path: à la carte glob lint targets + testProjects (multi-env).
// Centralized monorepo config. A root pnpm-workspace.yaml makes vite-plus
// centralize lint/fmt here; glob lint targets address each package, and Vitest
// `projects` (via testProjects) define per-package test environments. The root
// react plugin is inherited by the web project (extends: true).
//
// The react target uses the OBJECT form `{ files, rules }` instead of a bare glob
// list: the `rules` are folded into the same scoped override as the target's own
// react rules, so a consumer can tune them. Here we disable
// `react-perf/jsx-no-new-function-as-prop` for the web package — without this,
// the inline handler in packages/web/src/App.tsx would fail lint.
export default defineConfig({
  fmt: fmt(),
  lint: lint({
    node: ['packages/api/**'],
    react: {
      files: ['packages/web/**'],
      rules: { 'react-perf/jsx-no-new-function-as-prop': 'off' },
    },
  }),
  // oxlint-disable-next-line new-cap
  plugins: [react()],
  test: testProjects([
    testNode({ include: ['packages/api/**/*.test.ts'], name: 'api' }),
    testReact({ include: ['packages/web/**/*.test.{ts,tsx}'], name: 'web' }),
  ]),
});

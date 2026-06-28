import { vitePlusMonorepo } from '@dbtlr/tooling/vite-plus';
import { defineConfig } from 'vite-plus';

// Centralized monorepo lint config.
//
// A root `pnpm-workspace.yaml` makes vite-plus treat this tree as ONE monorepo
// and centralize lint/fmt here — per-package `lint` blocks are ignored (only
// Vite/Vitest/build config is honored per package). So a mixed-target monorepo
// (a Node service + a browser React app) addresses EACH target by file.
//
// The `node` and `react` lint targets accept a list of globs: instead of
// configuring the whole project (what `true` does), each emits a `files`-scoped
// override that enables its plugins and rules only for the matching package. The
// Node baseline still forbids `node:` builtins everywhere except `packages/api`,
// and React lint touches only `packages/web`.
export default defineConfig(
  vitePlusMonorepo({
    lint: {
      node: ['packages/api/**'],
      react: ['packages/web/**'],
    },
  }),
);

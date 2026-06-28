import { toolingConfig } from '@dbtlr/tooling';

// Centralized monorepo lint config.
//
// A root `pnpm-workspace.yaml` makes vite-plus treat this tree as ONE monorepo
// and centralize lint/fmt here — per-package `lint` blocks are ignored (only
// Vite/Vitest/build config is honored per package). So a mixed-target monorepo
// (a Node service + a browser React app) addresses EACH target by file.
//
// Passing a glob list to `node`/`react` (instead of `true`) scopes that target
// to those files: each emits a `files`-scoped override enabling its plugins and
// rules only for the matching package. Glob targets also mark this as a monorepo
// root, so no project-wide test/vite block is added — members own those. The Node
// baseline still forbids `node:` builtins everywhere except `packages/api`, and
// React lint touches only `packages/web`.
export default toolingConfig({
  node: ['packages/api/**'],
  react: ['packages/web/**'],
});

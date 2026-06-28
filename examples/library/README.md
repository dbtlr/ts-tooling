# library example

A tree-shakeable, environment-agnostic library other packages import.

- **Helper:** `vitePlusPackage({ pack: { entry: ['src/index.ts'] } })` — built with
  `vp pack` (declaration files, ESM output).
- **tsconfig:** `@dbtlr/tooling/tsconfig/base.json` with Bundler resolution.
- **Lint target:** default (browser/universal) — Node builtins are forbidden, so the
  library stays portable across runtimes.
- **Tests:** `vitestNode()`.

Acts as a test case: `vp check` + `vp test` confirm a universal library lints with no
Node builtins, type-checks, and is configured to package.

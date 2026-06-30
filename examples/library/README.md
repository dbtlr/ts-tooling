# library example

An environment-agnostic library other packages import.

- **Config:** `toolingPlugin({ pack: { entry: ['src/index.ts'] } })` — `pack` makes
  it build with `vp pack` (declaration files, ESM output). No `node`/`react`, so it
  keeps the default browser/universal lint target and Node test env.
- **tsconfig:** `@dbtlr/tooling/tsconfig/base.json` with Bundler resolution.
- **Lint target:** default (browser/universal) — Node builtins are forbidden, so the
  library stays portable across runtimes.

Acts as a test case: `vp check` + `vp test` confirm a universal library lints with no
Node builtins, type-checks, and is configured to package.

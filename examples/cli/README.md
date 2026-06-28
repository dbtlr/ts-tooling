# cli example

A command-line tool packaged for Node.js.

- **Helper:** `vitePlusPackage({ lint: { node: true }, pack: { entry: ['src/cli.ts'] } })`
  — built with `vp pack` (add `exe: true` for a standalone binary, plus a `bin`
  field in `package.json`).
- **tsconfig:** `@dbtlr/tooling/tsconfig/node.json`.
- **Tests:** `vitestNode()`.

Acts as a test case: `vp check` + `vp test` confirm the Node CLI shape lints,
type-checks, and is configured to bundle via `vp pack`.

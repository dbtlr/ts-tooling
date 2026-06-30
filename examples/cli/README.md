# cli example

A command-line tool packaged for Node.js.

- **Config:** `toolingPlugin({ node: true, pack: { entry: ['src/cli.ts'] } })` —
  node lint + Node test env; `pack` makes it build with `vp pack` (add `exe: true`
  for a standalone binary, plus a `bin` field in `package.json`).
- **tsconfig:** `@dbtlr/tooling/tsconfig/node.json`.

Acts as a test case: `vp check` + `vp test` confirm the Node CLI shape lints,
type-checks, and is configured to bundle via `vp pack`.

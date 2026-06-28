# Examples

Each subdirectory is a **standalone app** that consumes `@dbtlr/tooling` exactly
as a real consumer would — its own `package.json`, `vite.config.ts`, `tsconfig.json`,
and (so vp treats it as its own project rather than a monorepo package) its own
`pnpm-workspace.yaml`. They double as **integration test cases**: each is linted,
type-checked, and tested with the toolchain it configures.

| Example                                | Shape                       | Lint target               |
| -------------------------------------- | --------------------------- | ------------------------- |
| [`node-server`](./node-server)         | Node.js HTTP service        | `node: true`              |
| [`cli`](./cli)                         | Node.js CLI (packaged)      | `node: true`              |
| [`library`](./library)                 | Universal published library | default (browser-safe)    |
| [`react-spa`](./react-spa)             | Browser-only React SPA      | `react: true`             |
| [`react-fullstack`](./react-fullstack) | Isomorphic React (SSR)      | `react: true, node: true` |

Each depends on the local package via `"@dbtlr/tooling": "link:../.."`, so build it
first (`pnpm run build` at the repo root) before installing an example.

## Verifying

From the repo root, run every example through `vp check` + `vp test` with a
red/green summary:

```bash
pnpm run check:examples
```

This builds the package, then installs and verifies each example from its own path.

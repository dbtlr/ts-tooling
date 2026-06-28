# @dbtlr/tooling

Shared Vite+ config for Drew's TypeScript projects — one `toolingConfig()` entry point.

## Quick start

One call describes what the project is and returns a finished Vite+ config:

```ts
// vite.config.ts
import { toolingConfig } from '@dbtlr/tooling';

export default toolingConfig({ react: true }); // browser React app
```

Intent flags fan out to lint, test, and Vite config. Every project shape is a single `toolingConfig` call:

| Project                | Call                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| Node server            | `toolingConfig({ node: true })`                                            |
| Browser React app      | `toolingConfig({ react: true })`                                           |
| Isomorphic React (SSR) | `toolingConfig({ node: true, react: true })`                               |
| Published library      | `toolingConfig({ pack: { entry: ['src/index.ts'] } })`                     |
| Node CLI / package     | `toolingConfig({ node: true, pack: { entry: ['src/cli.ts'] } })`           |
| Monorepo root          | `toolingConfig({ node: ['packages/api/**'], react: ['packages/web/**'] })` |

See [`examples/`](./examples) for runnable, CI-verified versions of each.

### How intent maps to config

- `node` — Node lint target (allows `node:` builtins) + node test env.
- `react` — React lint plugins + modern-JSX rules + PascalCase filenames, jsdom test env, and the Vite react-app block.
- `node` + `react` — isomorphic: both lint targets, jsdom test.
- `pack` present — buildable/publishable package (adds the `pack` block).
- `test` — override the derived env (`'node'` / `'react'`) or omit it (`false`).

`node`/`react` accept `boolean | string[]`. **A boolean configures the whole project; a glob list scopes the target to those files** (a `files`-scoped oxlint override) and marks a **monorepo root** — lint is centralized and no project-wide test/Vite block is added (members own those). This is how one root config addresses each package's runtime in a vite-plus monorepo (whose `pnpm-workspace.yaml` centralizes lint config).

`toolingConfig` also accepts the Vite+ options (`lint` / `fmt` / `staged` / `pack`) as overrides on top of the derived defaults. (`node`/`react` are canonical at the top level, so they're not repeated under `lint`.)

### Strict by default

Lint is **strict by default** — warnings fail (`denyWarnings`) and type-aware lint + type checking run (`typeAware`, `typeCheck`). Opt out per-flag via the `lint` override, e.g. `toolingConfig({ react: true, lint: { typeCheck: false } })`.

## TypeScript presets

```json
{
  "extends": "@dbtlr/tooling/tsconfig/node.json",
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

Available presets:

- `@dbtlr/tooling/tsconfig/base.json`
- `@dbtlr/tooling/tsconfig/node.json`
- `@dbtlr/tooling/tsconfig/bun.json`
- `@dbtlr/tooling/tsconfig/react.json`
- `@dbtlr/tooling/tsconfig/monorepo.json`
- `@dbtlr/tooling/tsconfig/vitest.json`

## Granular helpers (escape hatch)

`toolingConfig` composes these; reach for them directly when you need finer control — e.g. a monorepo **member** package, or passing Vite plugins. Each is its own subpath export:

- `vitePlusBase` / `vitePlusPackage` (`@dbtlr/tooling/vite-plus`) — lint/fmt/staged, plus a `pack` block for buildable packages. `node`/`react` live under the `lint` option here. Strict by default.
- `vitestNode` / `vitestReact` (`@dbtlr/tooling/vitest`) — Vitest project config (node / jsdom).
- `viteReactApp` (`@dbtlr/tooling/vite`) — the Vite react-app block; pass `plugins: [react()]` for a real dev/build server.

```ts
import { defineConfig } from 'vite-plus';
import { vitePlusPackage } from '@dbtlr/tooling/vite-plus';
import { vitestNode } from '@dbtlr/tooling/vitest';

export default defineConfig({
  ...vitePlusPackage({ lint: { node: true }, pack: { entry: ['src/index.ts'] } }),
  ...vitestNode(),
});
```

Linting and formatting are delivered through Vite+ (`vp lint` / `vp fmt`), which bundles Oxlint — there is no standalone Oxlint subpath.

## Dependency policy

`@dbtlr/tooling` declares its tool integrations (`vite`, `vite-plus`) as **optional peer dependencies** — install the ones your config uses. `vite-plus` powers the whole toolchain (build / lint / fmt / test via `vp`).

## Verification

```bash
pnpm install
pnpm run check
pnpm run pack:dry
```

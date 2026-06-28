# @dbtlr/tooling

Tree-shakeable shared config helpers for Drew's TypeScript projects.

The package is intentionally split into subpath exports so consumers only import the tooling surface they need:

```ts
import { vitestNode } from '@dbtlr/tooling/vitest';
import { vitePlusPackage } from '@dbtlr/tooling/vite-plus';
```

Linting and formatting are delivered through Vite+ (`vp lint` / `vp fmt`), which bundles Oxlint — there is no standalone Oxlint subpath. Configure lint rules via the `lint` option on the Vite+ helpers below.

## Dependency policy

`@dbtlr/tooling` has **no runtime dependencies**. Tool integrations are optional peers and dev dependencies:

- `devDependencies` are used to build and test this package.
- `peerDependenciesMeta.optional` documents the tools consumers may install if they use a matching subpath.
- Source modules avoid top-level runtime imports from optional tools so unused subpaths remain tree-shakeable.

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

## Vitest

```ts
import { vitestNode } from '@dbtlr/tooling/vitest';

export default vitestNode({ include: ['src/**/*.test.ts'] });
```

## Vite+

```ts
import { defineConfig } from 'vite-plus';
import { vitePlusPackage } from '@dbtlr/tooling/vite-plus';

export default defineConfig(
  vitePlusPackage({
    pack: { entry: ['src/index.ts'] },
  }),
);
```

Two helpers: `vitePlusBase` (lint + format + staged) and `vitePlusPackage` (base plus a `pack` block for buildable/publishable packages). Both are **strict by default** — warnings fail (`denyWarnings`) and type-aware lint + type checking run (`typeAware`, `typeCheck`). Opt out of any of these per-flag, e.g. `lint: { typeCheck: false }`.

### Lint targets

The lint helpers default to a **browser** target. Two options adapt the rules to your runtime. Each accepts `boolean | string[]`:

- `node?: boolean | string[]` (default `false`) — when `true`, enables the oxlint `node` plugin and allows Node.js builtin imports across the whole project. When `false`, the `node` plugin is omitted and `import/no-nodejs-modules` is set to `error` (browser code may not import builtins). Set `true` for Node servers, CLIs, and packages.
- `react?: boolean | string[]` (default `false`) — when `true`, enables the `react`, `react-perf`, and `jsx-a11y` plugins, disables `react/react-in-jsx-scope` for the React 17+ automatic JSX runtime, and allows PascalCase component filenames.

```ts
vitePlusPackage({ lint: { node: true } }); // Node server / CLI / package
vitePlusBase({ lint: { react: true } }); // browser-only React app
vitePlusBase({ lint: { node: true, react: true } }); // isomorphic React (SSR)
```

Passing a **list of globs** instead of `true` scopes the target to just those files — it emits a `files`-scoped oxlint override rather than whole-project config. This is how a vite-plus **monorepo** (whose root `pnpm-workspace.yaml` centralizes lint config in the root `vite.config.ts`) addresses each package's target from one config:

```ts
vitePlusBase({
  lint: {
    node: ['packages/api/**'], // node: builtins allowed only here
    react: ['packages/web/**'], // React lint only here
  },
});
```

See [`examples/monorepo`](./examples/monorepo) for a runnable, CI-verified version.

## Verification

```bash
pnpm install
pnpm run check
pnpm run pack:dry
```

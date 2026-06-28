# @dbtlr/tooling

Tree-shakeable shared config helpers for Drew's TypeScript projects.

The package is intentionally split into subpath exports so consumers only import the tooling surface they need:

```ts
import { vitestNode } from "@dbtlr/tooling/vitest";
import { vitePlusPackage } from "@dbtlr/tooling/vite-plus";
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
import { vitestNode } from "@dbtlr/tooling/vitest";

export default vitestNode({ include: ["src/**/*.test.ts"] });
```

## Vite+

```ts
import { defineConfig } from "vite-plus";
import { vitePlusPackage } from "@dbtlr/tooling/vite-plus";

export default defineConfig(
  vitePlusPackage({
    pack: { entry: ["src/index.ts"] },
    lint: { typeAware: true },
  }),
);
```

## Verification

```bash
pnpm install
pnpm run check
pnpm run pack:dry
```

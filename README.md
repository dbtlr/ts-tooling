# @dbtlr/tooling

Tree-shakeable shared config helpers for Drew's TypeScript projects.

The package is intentionally split into subpath exports so consumers only import the tooling surface they need:

```ts
import { oxlint } from "@dbtlr/tooling/oxlint";
import { vitestNode } from "@dbtlr/tooling/vitest";
import { vitePlusPackage } from "@dbtlr/tooling/vite-plus";
```

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

## Oxlint

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint";
import { oxlint } from "@dbtlr/tooling/oxlint";

export default defineConfig({
  extends: [oxlint({ target: "node", tests: "vitest", typeAware: true, strictWarnings: true })],
  rules: {
    "max-statements": ["warn", 40],
  },
});
```

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

# @dbtlr/tooling

Shared Vite+ config for Drew's TypeScript projects — two layers: a batteries plugin and à la carte value helpers.

## Two layers

**Layer 1 — à la carte value helpers** (`lint`, `fmt`, `staged`, `pack`, `testNode`, `testReact`, `testProjects`, `viteReactApp`): each returns the config value for one key; you compose them yourself and place the values in `defineConfig`. Reach for these when you need full control — live Vite plugins, a monorepo root with per-package test environments, or partial adoption on an existing codebase.

**Layer 2 — batteries plugin** (`toolingPlugin`): a Vite plugin you drop into `plugins`. It contributes `lint`, `fmt`, `test`, `staged`, and (if `pack` is specified) `pack` as overridable defaults. Your own top-level config keys win over the plugin's defaults (defer-to-user).

## Quick start — batteries

Drop `toolingPlugin()` into `plugins` and declare your project intent:

```ts
// vite.config.ts
import { defineConfig, toolingPlugin } from '@dbtlr/tooling';

export default defineConfig({ plugins: [toolingPlugin({ node: true })] }); // Node service
```

Override any block inline — your top-level key wins over the plugin's default:

```ts
export default defineConfig({
  lint: { rules: { 'unicorn/no-null': 'error' } }, // wins; plugin's lint defaults defer to this
  plugins: [toolingPlugin({ node: true, react: true })],
});
```

### Intent options

| Option                             | Effect                                                             |
| ---------------------------------- | ------------------------------------------------------------------ |
| `node: true`                       | Node lint target (allow `node:` builtins) + node test env          |
| `react: true`                      | React lint plugins + modern-JSX rules + jsdom test env + DOM setup |
| `node: true, react: true`          | Isomorphic: both lint targets, jsdom test                          |
| `pack: { entry: [...] }`           | Buildable / publishable package (`pack` block)                     |
| `test: 'node' \| 'react' \| false` | Override the derived test env or omit the test block               |

`node`/`react` also accept a **glob list** (`string[]`) or an **object form** (`{ files, rules }`). A glob list marks a monorepo lint root — lint is centralized, no project-wide test/Vite block is added (members own those). The object form folds consumer rules into the same scoped override as the target's defaults, so you can tune or disable a target rule for those files.

`toolingPlugin` also accepts `lint`, `fmt`, and `staged` as extra options layered under the derived defaults — your own inline top-level keys still win.

### Strict by default

Lint is strict by default: `denyWarnings`, `typeAware`, and `typeCheck` are on. Opt out per-flag via the `lint` option:

```ts
toolingPlugin({ react: true, lint: { typeCheck: false } });
```

## How the plugin works (defer-to-user)

`toolingPlugin()` is a Vite plugin. In its `configResolved` hook it deep-merges each concern block (lint/fmt/test/staged/pack) under the consumer's already-resolved values — so any key you write at the top level of `defineConfig` wins, per-key for objects and outright for scalars. Concatenated arrays are de-duplicated.

The one exception: the `test.environment: 'jsdom'` entry for the react/DOM path is surfaced via `config()` (before resolution) because Vitest reads `test.environment` pre-resolution. If you supply your own `test.environment`, the plugin defers to yours.

## Layer 1 — à la carte helpers

Each helper returns the config **value** for one key. Compose them in `defineConfig`:

```ts
import { defineConfig, domSetup, fmt, lint, testReact } from '@dbtlr/tooling';
import react from '@vitejs/plugin-react';

export default defineConfig({
  fmt: fmt(),
  lint: lint({ react: true }),
  plugins: [react(), domSetup()],
  test: testReact(),
});
```

Available helpers (all exported from `@dbtlr/tooling`):

| Helper                             | Returns                     | Key         |
| ---------------------------------- | --------------------------- | ----------- |
| `lint(options?)`                   | lint block                  | `lint`      |
| `fmt(options?)`                    | fmt block                   | `fmt`       |
| `staged(options?)`                 | staged block                | `staged`    |
| `pack(options?)`                   | pack block                  | `pack`      |
| `testNode(options?)`               | bare test value (node env)  | `test`      |
| `testReact(options?)`              | bare test value (jsdom env) | `test`      |
| `testProjects(projects, options?)` | `{ projects: [...] }` value | `test`      |
| `viteReactApp(options?)`           | Vite react-app fragment     | (multi-key) |

## `domSetup()` — DOM matchers plugin

`domSetup()` is an additive Vite plugin. It contributes two things:

1. Registers `@dbtlr/tooling/setup/dom` as a Vitest `setupFile` (jest-dom matchers).
2. Adds the tooling root to `server.fs.allow` (needed so Vite can serve the setup module under a `link:`/symlink install).

Add it to `plugins` when writing DOM/React tests à la carte:

```ts
plugins: [react(), domSetup()];
```

**`toolingPlugin({ react: true })` includes this contribution automatically** — you do not add `domSetup()` separately when using the batteries plugin.

### `@dbtlr/tooling/setup/dom` — setup module

The `@dbtlr/tooling/setup/dom` subpath registers `@testing-library/jest-dom` matchers. `@testing-library/jest-dom` is an **optional peer** — install it when you use DOM matchers:

```bash
pnpm add -D @testing-library/jest-dom
```

## `testProjects()` — Vitest monorepo model

`testProjects` collects bare `testNode`/`testReact` values into a Vitest `projects` array. Each project inherits the root config by default (`extends: true`), so a react project picks up the root `@vitejs/plugin-react`. Pair with glob lint targets to centralize the entire monorepo config in one file:

```ts
import { defineConfig, fmt, lint, testNode, testProjects, testReact } from '@dbtlr/tooling';
import react from '@vitejs/plugin-react';

export default defineConfig({
  fmt: fmt(),
  lint: lint({
    node: ['packages/api/**'],
    react: {
      files: ['packages/web/**'],
      rules: { 'react-perf/jsx-no-new-function-as-prop': 'off' },
    },
  }),
  plugins: [react()],
  test: testProjects([
    testNode({ include: ['packages/api/**/*.test.ts'], name: 'api' }),
    testReact({ include: ['packages/web/**/*.test.{ts,tsx}'], name: 'web' }),
  ]),
});
```

See [`examples/monorepo`](./examples/monorepo) for the full pnpm-workspace version.

## `defineConfig` — when to use it

Use `@dbtlr/tooling`'s `defineConfig` (not vite-plus's) whenever your `plugins` array contains live or array-returning plugins (`react()`, `VitePWA()`, `toolingPlugin()`, `domSetup()`). vite-plus's overloaded `defineConfig` trips `TS2321: Excessive stack depth` on such plugins; this single-signature delegate accepts `plugins` as vite's `PluginOption` and avoids the error. Temporary shim until vite-plus fixes its overloads.

```ts
import { defineConfig } from '@dbtlr/tooling'; // not from 'vite-plus'
```

## Examples

Seven CI-verified examples cover the full composition matrix. See [`examples/`](./examples) for runnable configs.

| Example           | Real problem                   | Composition path                                                                                        |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `node-server`     | Node service                   | batteries — `plugins: [toolingPlugin({ node: true })]`                                                  |
| `cli`             | CLI bin                        | batteries — `toolingPlugin({ node: true, pack })`                                                       |
| `library`         | Published lib                  | batteries — `toolingPlugin({ pack })`                                                                   |
| `react-fullstack` | Isomorphic SSR app             | batteries — `toolingPlugin({ node: true, react: true })` + inline `lint.rules` override (defer-to-user) |
| `react-spa`       | SPA with live plugins          | à la carte — `lint` + `fmt` + `testReact` + `plugins: [react(), VitePWA(), domSetup()]`                 |
| `monorepo`        | pnpm workspace                 | à la carte — glob lint targets + `testProjects` (multi-env)                                             |
| `adopting`        | Existing codebase mid-adoption | à la carte partial — `fmt()` + lenient `lint({ denyWarnings: false, typeAware: false })`                |

## Progressive adoption

Bring an existing codebase under `@dbtlr/tooling` incrementally — no need to adopt everything at once:

1. **Formatting only.** Start with `fmt()` to normalize style without touching lint or tests:

   ```ts
   export default defineConfig({ fmt: fmt() });
   ```

2. **Lenient lint.** Add `lint` with `denyWarnings: false` and `typeAware: false` so violations report as warnings while you clean up:

   ```ts
   export default defineConfig({
     fmt: fmt(),
     lint: lint({ denyWarnings: false, typeAware: false }),
   });
   ```

3. **Tighten.** Drop the lenient flags once the codebase is clean. Strict mode (`denyWarnings`, `typeAware`, `typeCheck`) is the house default.

See [`examples/adopting`](./examples/adopting) — it demonstrates phase 2 (lenient lint on an existing codebase).

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

## Bun projects

There is no separate `bun` lint target — none is needed. Bun runs `node:` builtins, so the **`node` target** is the right lint target for Bun code (the oxlint `node` plugin enables nothing Bun-hostile, and `bun:` imports aren't flagged). Pair it with the `bun` TypeScript preset and `@types/bun` for the `Bun` global: extend `@dbtlr/tooling/tsconfig/bun.json` and use `toolingPlugin({ node: true })` (or a glob `node` target in a monorepo).

## Dependency policy

`@dbtlr/tooling` declares its tool integrations as **optional peer dependencies** — install the ones your config uses:

- `vite-plus` (`>=0.2.0`) — powers the whole toolchain (`vp` build/lint/fmt/test/check).
- `vite` (`>=8.0.0`) — Vite itself (vite-plus bundles it; add only if your config needs it directly).
- `@testing-library/jest-dom` (`>=6`) — optional; required only if you use `@dbtlr/tooling/setup/dom`.

## Verification

```bash
pnpm install
pnpm run check
pnpm run pack:dry
```

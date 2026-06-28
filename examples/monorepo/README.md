# `@dbtlr/tooling` monorepo example

A pnpm-workspace monorepo with **two packages that need different lint targets**:

- `packages/api` — a Node service (imports `node:http`)
- `packages/web` — a browser React app (JSX, PascalCase component files)

It exists to demonstrate — and to **test in CI** — how a single `@dbtlr/tooling`
lint config serves a mixed-target monorepo.

## The mechanism: centralized lint, per-package overrides

A root `pnpm-workspace.yaml` makes vite-plus treat the whole tree as **one
monorepo**. As a result vite-plus **centralizes lint and format config in the
root `vite.config.ts`** — a `lint` block inside a member package's own
`vite.config.ts` is **ignored**. (Per-package Vite/Vitest/**build** config _is_
still honored; only lint/fmt are centralized.)

So you cannot give `packages/web` `lint: { react: true }` and `packages/api`
`lint: { node: true }` in their own configs. Instead the **root** config names
each target with the **globs it applies to**. A `node` / `react` lint option
accepts either `true` (configure the whole project) or a list of globs — and a
glob list emits a [`files`-scoped override fragment][oxlint-overrides] for just
those files:

```ts
// vite.config.ts (root)
vitePlusMonorepo({
  lint: {
    node: ['packages/api/**'], // allow node: builtins only here
    react: ['packages/web/**'], // React plugins + modern-JSX rules only here
  },
});
```

Under the hood each glob target becomes an override: oxlint applies the browser
baseline everywhere and layers each target onto its matching files, so React
rules only touch `packages/web` and Node builtins are only allowed in
`packages/api`. (You can still drop to a raw `lint.overrides: [...]` fragment for
anything the `node` / `react` targets don't cover.)

## Why this example is more than documentation

`pnpm run check:examples` (and CI) runs `vp check` + `vp test` here. The glob
targets are **load-bearing**: drop them (or the files they name) and `vp check`
fails — `import/no-nodejs-modules` on `api/server.ts`, `unicorn/filename-case` on
`web/App.tsx`. The example therefore _proves_ the pattern keeps working, it
doesn't just describe it.

[oxlint-overrides]: https://oxc.rs/docs/guide/usage/linter/config.html

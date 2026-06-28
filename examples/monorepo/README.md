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
`lint: { node: true }` in their own configs. Instead the **root** config carries
every target as a [`files`-scoped override fragment][oxlint-overrides]:

```ts
// vite.config.ts (root)
vitePlusMonorepo({
  lint: {
    overrides: [
      {
        files: ['packages/web/**'],
        plugins: ['react', 'react-perf', 'jsx-a11y'],
        rules: {
          /* … */
        },
      },
      {
        files: ['packages/api/**'],
        plugins: ['node'],
        rules: { 'import/no-nodejs-modules': 'off' },
      },
    ],
  },
});
```

oxlint applies the base config everywhere and layers each override onto its
matching files, so React rules only touch `packages/web` and Node builtins are
only allowed in `packages/api`.

## Why this example is more than documentation

`pnpm run check:examples` (and CI) runs `vp check` + `vp test` here. The override
fragments are **load-bearing**: delete them and `vp check` fails —
`import/no-nodejs-modules` on `api/server.ts`, `unicorn/filename-case` on
`web/App.tsx`. The example therefore _proves_ the pattern keeps working, it
doesn't just describe it.

## Known rough edge — hand-authored fragments

The override fragments above **duplicate** what `lint: { react: true }` and
`lint: { node: true }` already produce as whole-project config (the React plugin
list, `react/react-in-jsx-scope`, the `filename-case` widening, the
`no-nodejs-modules` toggle). There is no first-class helper to emit them as
`files`-scoped fragments yet. Closing that gap — letting the `react` / `node`
lint options accept a list of globs and emit the scoped override automatically —
is the motivation this example was built to capture.

[oxlint-overrides]: https://oxc.rs/docs/guide/usage/linter/config.html

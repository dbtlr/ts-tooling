# react-fullstack example

An isomorphic React app that renders on the server and hydrates in the browser —
the shape used by frameworks like TanStack Start, Next.js, and Remix.

- **Helper:** `vitePlusBase({ lint: { node: true, react: true } })` — both flags on:
  React plugins for the UI, and the `node` plugin so server code may import Node
  builtins (`node:http`).
- **tsconfig:** `@dbtlr/tooling/tsconfig/react.json` with `types: ["vite/client", "node"]`
  added for the server entry.
- **Tests:** `vitestReact()` (jsdom), exercising server-side rendering.

This is a thin stand-in for a full SSR framework — it captures the lint/config
shape (React **and** Node together) without the framework's scaffolding.

Acts as a test case: `vp check` + `vp test` confirm an isomorphic target lints both
React and Node code, type-checks against both, and renders on the server.

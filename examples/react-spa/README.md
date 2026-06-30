# react-spa example

A browser-only React single-page app.

- **Config:** `toolingPlugin({ react: true })` — `react` enables the React lint
  plugins + modern JSX runtime (no `import React`), the jsdom test env, and the Vite
  react-app block. `node` stays off, so this browser target forbids Node builtins.
- **tsconfig:** `@dbtlr/tooling/tsconfig/react.json` (DOM libs, `jsx: react-jsx`).

For a real dev/build server, add `@vitejs/plugin-react` via the granular
`viteReactApp({ plugins: [react()] })` helper.

Acts as a test case: `vp check` + `vp test` confirm React/JSX lints under the
browser target and renders.

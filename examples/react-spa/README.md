# react-spa example

A browser-only React single-page app.

- **Helper:** `vitePlusBase({ lint: { react: true } })` — `react: true` enables the
  React lint plugins and the modern JSX runtime (no `import React`). `node` stays
  off, so this browser target forbids Node builtins.
- **tsconfig:** `@dbtlr/tooling/tsconfig/react.json` (DOM libs, `jsx: react-jsx`).
- **Tests:** `vitestReact()` (jsdom environment).

For a real dev/build server, add `@vitejs/plugin-react` to
`viteReactApp({ plugins: [react()] })`.

Acts as a test case: `vp check` + `vp test` confirm React/JSX lints under the
browser target and renders.

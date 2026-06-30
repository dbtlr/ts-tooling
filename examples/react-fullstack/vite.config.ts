import { defineConfig, toolingPlugin } from '@dbtlr/tooling';

// Composition path: toolingPlugin batteries (node: true, react: true) — isomorphic app.
// Isomorphic React: `react` for the UI (lint + jsdom test), `node` so the server
// entry may import Node builtins (`node:http`).
//
// The inline `lint.rules` override below layers over the plugin's defaults (defer-to-user):
// toolingPlugin sets house lint rules via configResolved, but user-supplied keys win,
// so any rule listed here overrides without touching the plugin source.
export default defineConfig({
  lint: {
    rules: {
      // Example override: enforce no-null in this project.
      'unicorn/no-null': 'error',
    },
  },
  plugins: [toolingPlugin({ node: true, react: true })],
});

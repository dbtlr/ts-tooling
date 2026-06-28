import { viteReactApp } from '@dbtlr/tooling/vite';
import { vitePlusBase } from '@dbtlr/tooling/vite-plus';
import { vitestReact } from '@dbtlr/tooling/vitest';
import { defineConfig } from 'vite-plus';

// Isomorphic React: both flags on — `react` for the UI, `node` so the server
// entry may import Node builtins (`node:http`).
export default defineConfig({
  ...vitePlusBase({ lint: { node: true, react: true } }),
  ...viteReactApp(),
  ...vitestReact(),
});

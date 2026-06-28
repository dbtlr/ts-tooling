import { viteReactApp } from '@dbtlr/tooling/vite';
import { vitePlusBase } from '@dbtlr/tooling/vite-plus';
import { vitestReact } from '@dbtlr/tooling/vitest';
import { defineConfig } from 'vite-plus';

// Browser-only React: `react: true` enables the React lint plugins; `node` stays
// off, so Node builtins are forbidden. Add `@vitejs/plugin-react` to
// `viteReactApp({ plugins: [react()] })` for a real dev/build server.
export default defineConfig({
  ...vitePlusBase({ lint: { react: true } }),
  ...viteReactApp(),
  ...vitestReact(),
});

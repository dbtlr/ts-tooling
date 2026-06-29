import { defineConfig, viteReactApp, vitePlusBase, vitestReact } from '@dbtlr/tooling';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// A real browser React SPA with a dev/build server: `@vitejs/plugin-react` for
// JSX + fast refresh and `vite-plugin-pwa` for offline/installable support —
// both things real apps do. Plugins live at the top level (not in viteReactApp,
// whose `plugins` is JSON-typed) because they are live plugin objects.
//
// `defineConfig` here is `@dbtlr/tooling`'s, not vite-plus's: vite-plus's
// overloaded `defineConfig` trips TS2321 ("excessive stack depth") on
// array-returning plugins like `@vitejs/plugin-react` (which returns
// `PluginOption[]` → `Plugin[][]`). Ours accepts them. Swap it for vite-plus's
// `defineConfig` and this config fails to type-check — the regression this guards.
export default defineConfig({
  ...vitePlusBase({ lint: { react: true } }),
  ...viteReactApp(),
  ...vitestReact(),
  // VitePWA is a PascalCase plugin factory, not a constructor — new-cap is a
  // false positive here (a normal thing apps hit with plugin factories).
  // oxlint-disable-next-line new-cap
  plugins: [react(), VitePWA({ registerType: 'autoUpdate' })],
});

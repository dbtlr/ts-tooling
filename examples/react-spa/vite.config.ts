import { defineConfig, fmt, lint, testReact, viteReactApp } from '@dbtlr/tooling';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Composition path: à la carte defineConfig — lint + fmt + testReact + viteReactApp + live plugins.
// A real browser React SPA. Live plugins (@vitejs/plugin-react, vite-plugin-pwa)
// stay at the top level. `defineConfig` is @dbtlr/tooling's (not vite-plus's) —
// it accepts array-returning plugins that trip vite-plus's overloaded signature.
// `testReact()` pulls in `@dbtlr/tooling/setup/dom` as a setupFile so
// @testing-library/jest-dom matchers are registered in every jsdom test.
export default defineConfig({
  ...viteReactApp(),
  fmt: fmt(),
  lint: lint({ react: true }),
  // oxlint-disable-next-line new-cap
  plugins: [react(), VitePWA({ registerType: 'autoUpdate' })],
  test: testReact(),
});

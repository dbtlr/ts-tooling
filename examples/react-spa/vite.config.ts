import { defineConfig, domSetup, fmt, lint, testReact } from '@dbtlr/tooling';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Composition path: à la carte defineConfig — lint + fmt + testReact + live plugins.
// A real browser React SPA. Live plugins (@vitejs/plugin-react, vite-plugin-pwa)
// stay at the top level. `defineConfig` is @dbtlr/tooling's (not vite-plus's) —
// it accepts array-returning plugins that trip vite-plus's overloaded signature.
// `domSetup()` supplies the jest-dom setupFile + server.fs.allow (formerly auto-added
// by testReact; now explicit so the à la carte consumer controls it).
export default defineConfig({
  fmt: fmt(),
  lint: lint({ react: true }),
  // oxlint-disable-next-line new-cap
  plugins: [react(), VitePWA({ registerType: 'autoUpdate' }), domSetup()],
  test: testReact(),
});

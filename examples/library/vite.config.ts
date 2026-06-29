import { defineConfig, toolingConfig } from '@dbtlr/tooling';

// Composition path: toolingConfig({ pack }) — browser lint + pack for a published lib.
export default defineConfig({
  plugins: [toolingConfig({ pack: { dts: false, entry: ['src/index.ts'], exports: false } })],
});

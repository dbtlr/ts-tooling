import { defineConfig, toolingPlugin } from '@dbtlr/tooling';

// Composition path: toolingPlugin({ pack }) — browser lint + pack for a published lib.
export default defineConfig({
  plugins: [toolingPlugin({ pack: { dts: false, entry: ['src/index.ts'], exports: false } })],
});

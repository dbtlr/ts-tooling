import { defineConfig, toolingConfig } from '@dbtlr/tooling';

// Composition path: toolingConfig({ node, pack }) — pack override for a CLI bin.
export default defineConfig({
  plugins: [
    toolingConfig({ node: true, pack: { dts: false, entry: ['src/cli.ts'], exports: false } }),
  ],
});

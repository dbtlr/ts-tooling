import { defineConfig, toolingPlugin } from '@dbtlr/tooling';

// Composition path: toolingPlugin({ node, pack }) — pack override for a CLI bin.
export default defineConfig({
  plugins: [
    toolingPlugin({ node: true, pack: { dts: false, entry: ['src/cli.ts'], exports: false } }),
  ],
});

import { toolingConfig } from '@dbtlr/tooling';

// Composition path: toolingConfig({ node, pack }) — pack override for a CLI bin.
export default toolingConfig({
  node: true,
  pack: { dts: false, entry: ['src/cli.ts'], exports: false },
});

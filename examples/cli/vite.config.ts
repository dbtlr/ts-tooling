import { toolingConfig } from '@dbtlr/tooling';

export default toolingConfig({
  node: true,
  pack: { dts: false, entry: ['src/cli.ts'], exports: false },
});

import { toolingConfig } from '@dbtlr/tooling';

export default toolingConfig({ pack: { dts: false, entry: ['src/index.ts'], exports: false } });

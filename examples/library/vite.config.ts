import { toolingConfig } from '@dbtlr/tooling';

// Composition path: toolingConfig({ pack }) — browser lint + pack for a published lib.
export default toolingConfig({ pack: { dts: false, entry: ['src/index.ts'], exports: false } });

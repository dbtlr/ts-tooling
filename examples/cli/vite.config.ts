import { vitePlusPackage } from '@dbtlr/tooling/vite-plus';
import { vitestNode } from '@dbtlr/tooling/vitest';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  ...vitePlusPackage({
    lint: { node: true },
    pack: { dts: false, entry: ['src/cli.ts'], exports: false },
  }),
  ...vitestNode(),
});

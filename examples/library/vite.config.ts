import { vitePlusPackage } from '@dbtlr/tooling/vite-plus';
import { vitestNode } from '@dbtlr/tooling/vitest';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  ...vitePlusPackage({ pack: { dts: false, entry: ['src/index.ts'], exports: false } }),
  ...vitestNode(),
});

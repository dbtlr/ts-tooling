import { vitePlusBase } from '@dbtlr/tooling/vite-plus';
import { vitestNode } from '@dbtlr/tooling/vitest';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  ...vitePlusBase({ lint: { node: true, typeAware: true } }),
  ...vitestNode(),
});

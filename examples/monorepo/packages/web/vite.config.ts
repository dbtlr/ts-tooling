import { vitestReact } from '@dbtlr/tooling/vitest';
import { defineConfig } from 'vite-plus';

// Per-package config carries ONLY build/test — vite-plus honors those per
// package. Lint/fmt are centralized in the monorepo root vite.config.ts; a
// `lint` block here would be ignored.
export default defineConfig({
  ...vitestReact(),
});

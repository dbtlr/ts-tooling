import { defineConfig, toolingConfig } from '@dbtlr/tooling';

// Composition path: toolingConfig batteries (node: true) — Node service.
export default defineConfig({ plugins: [toolingConfig({ node: true })] });

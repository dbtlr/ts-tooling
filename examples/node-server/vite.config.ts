import { defineConfig, toolingPlugin } from '@dbtlr/tooling';

// Composition path: toolingPlugin batteries (node: true) — Node service.
export default defineConfig({ plugins: [toolingPlugin({ node: true })] });

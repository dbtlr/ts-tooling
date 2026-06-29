import { toolingConfig } from '@dbtlr/tooling';

// Composition path: toolingConfig({ node, react }) — combined + default react test/setup.
// Isomorphic React: `react` for the UI (lint + jsdom test), `node` so the server
// entry may import Node builtins (`node:http`).
export default toolingConfig({ node: true, react: true });

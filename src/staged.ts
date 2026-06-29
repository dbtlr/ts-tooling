import type { JsonObject } from './types.js';

// The lint-staged-style pre-commit map vite-plus reads on `vp staged`. The house
// default runs the full fix gate on every staged file; caller commands merge over
// the default, e.g. to scope by extension or add a second command.
const staged = (commands: JsonObject = {}): JsonObject => ({ '*': 'vp check --fix', ...commands });

export { staged };

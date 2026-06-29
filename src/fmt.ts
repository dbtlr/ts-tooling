import type { JsonObject } from './types.js';

// The shared formatter config (oxfmt via vite-plus). Single quotes + sorted
// imports are the house style; the ignore list keeps oxfmt off generated/output
// files — notably CHANGELOG.md, which release-please owns and reformats every
// release PR. Caller options spread last, so a caller can override any default
// (including replacing `ignorePatterns` wholesale).
const fmt = (options: JsonObject = {}): JsonObject => ({
  ignorePatterns: [
    'pnpm-lock.yaml',
    'bun.lock',
    'CHANGELOG.md',
    'dist/**',
    'build/**',
    'node_modules/**',
    'coverage/**',
    '.turbo/**',
    '.vite/**',
  ],
  singleQuote: true,
  sortImports: { ignoreCase: true },
  ...options,
});

export { fmt };

import type { JsonObject } from './types.js';

// Typed `vp staged` (lint-staged-style) command map. vite-plus's StagedConfig
// also allows a top-level function form and function-valued commands; the house
// helper is the JSON-serializable map form (a glob → shell command, or an array
// of them), which is what composes with the house default and merges cleanly.
type StagedOptions = Record<string, string | string[]>;

// The pre-commit map vite-plus reads on `vp staged`. The house default runs the
// full fix gate on every staged file; caller commands merge over it per glob, e.g.
// to scope by extension or add a second command.
const staged = (commands: StagedOptions = {}): JsonObject => ({
  '*': 'vp check --fix',
  ...commands,
});

export { staged };
export type { StagedOptions };

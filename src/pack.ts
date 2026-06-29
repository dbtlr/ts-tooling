import type { JsonObject } from './types.js';

// The `vp pack` (tsdown) build config. Defaults: experimental tsgo dts emit and
// generated exports. Caller options spread last (e.g. `{ dts: true }` for the
// rolldown dts path, or `exports: false` to hand-maintain the exports map).
const pack = (options: JsonObject = {}): JsonObject => ({
  dts: { tsgo: true },
  exports: true,
  ...options,
});

export { pack };

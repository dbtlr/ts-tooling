import type { UserConfig } from 'vite-plus';

import type { JsonObject } from './types.js';

// Typed `vp pack` (tsdown) options, derived from vite-plus's public config type so
// they stay in lockstep with the toolchain. vite-plus accepts a single config or
// an array of them; the helper produces a single config, so the array form is
// excluded here.
type PackOptions = Exclude<NonNullable<UserConfig['pack']>, readonly unknown[]>;

// The `vp pack` build config. Defaults: experimental tsgo dts emit and generated
// exports. Caller options spread last and win (e.g. `{ dts: true }` for the
// rolldown dts path, or `exports: false` to hand-maintain the exports map).
//
// PackOptions isn't structurally JsonObject — its dts/exports/plugins fields use
// tsdown interfaces, some carrying functions (build plugins, hooks). Bridge to the
// JsonObject return with a documented cast (same pattern as lint.ts's LintOverride):
// the typed input is the consumer-facing win, and on the à la carte pack() path the
// object goes straight into defineConfig with any functions passing through intact.
// (The toolingPlugin merge path's array de-dup keys by JSON.stringify, which can't
// distinguish function-bearing entries — a pre-existing limitation of that path,
// not of pack typing; build configs rarely carry plugin arrays.)
const pack = (options: PackOptions = {}): JsonObject => ({
  dts: { tsgo: true },
  exports: true,
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  ...(options as unknown as JsonObject),
});

export { pack };
export type { PackOptions };

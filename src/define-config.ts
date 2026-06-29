import { defineConfig as defineVitePlusConfig } from 'vite-plus';
import type { UserConfig } from 'vite-plus';

// vite-plus's `defineConfig` overloads blow the type-checker's stack (TS2321:
// "Excessive stack depth comparing types") when `plugins` contains array-returning
// plugins like `@vitejs/plugin-react` (which returns `PluginOption[]`, making the
// array `Plugin[][]`). Vite's own `defineConfig` accepts the same input. This
// re-export accepts those plugins and delegates to vite-plus at runtime so its
// guard-plugin injection is preserved.
//
// `plugins` is intentionally loose (`readonly unknown[]`): a config helper in a
// separate package is typed against ITS vite, but a consumer's plugins come from
// THEIR vite — often a different major (e.g. our vite@7 vs a consumer on vite@8).
// Structural typing across that skew is exactly what trips TS2321/TS2322, and
// vite's own `defineConfig` only avoids it because the consumer imports it from
// their own vite. So we don't tie `plugins` to a specific `PluginOption`; vite
// validates plugin shape at runtime regardless. Everything else keeps its type.
//
// Temporary shim over the upstream vite-plus typing bug; remove once vite-plus
// widens its `defineConfig` plugin typing.
type ToolingDefineConfigInput = Omit<UserConfig, 'plugins'> & {
  readonly plugins?: readonly unknown[];
};

const defineConfig = (config: ToolingDefineConfigInput): UserConfig =>
  // The widened input is structurally a vite-plus UserConfig once plugins are
  // accepted; bridge to vite-plus's narrower param here (not at the call site).
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  defineVitePlusConfig(config as unknown as UserConfig);

export { defineConfig };
export type { ToolingDefineConfigInput };

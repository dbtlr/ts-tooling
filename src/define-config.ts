import { fileURLToPath } from 'node:url';

import type { PluginOption } from 'vite';
import { defineConfig as defineVitePlusConfig } from 'vite-plus';
import type { UserConfig } from 'vite-plus';

// vite-plus's `defineConfig` is overloaded, and the overload resolution blows the
// type-checker's stack (TS2321: "Excessive stack depth comparing types") when
// `plugins` contains array-returning plugins like `@vitejs/plugin-react` (which
// returns `PluginOption[]`, making the array `Plugin[][]`). This is independent of
// vite version — it reproduces even when the app and this package are on the same
// vite. Vite's own `defineConfig` accepts the same input.
//
// This re-export takes `plugins` as vite's `PluginOption` (the real type — our
// `.d.ts` references `import('vite')`, which resolves to the consumer's own vite)
// and delegates to vite-plus at runtime via a single, non-overloaded signature, so
// the guard-plugin injection is preserved and the overload-depth blowup is avoided.
//
// Temporary shim over the upstream vite-plus typing bug; remove once vite-plus
// fixes its `defineConfig` overloads.
type ToolingDefineConfigInput = Omit<UserConfig, 'plugins'> & {
  readonly plugins?: readonly PluginOption[];
};

// The real path of the tooling package root. In a normal npm install this is
// already inside node_modules (always allowed by Vite's fs server). With a
// pnpm `link:` dep the symlink resolves to a path outside the project root,
// which Vite's server.fs.strict would block when loading setup/dom.mjs.
// The plugin below adds this path to server.fs.allow via configResolved so
// the default allow list (project root, workspace root) is preserved and we
// only append — using config() would replace the array.
const TOOLING_ROOT = fileURLToPath(new URL('..', import.meta.url));

const fsFix = {
  // configResolved mutates the already-merged allow list instead of replacing it.
  configResolved(config: { server: { fs: { allow: string[] } } }) {
    if (!config.server.fs.allow.includes(TOOLING_ROOT)) {
      config.server.fs.allow.push(TOOLING_ROOT);
    }
  },
  name: '@dbtlr/tooling:fs-allow',
} as const;

const defineConfig = (config: ToolingDefineConfigInput): UserConfig =>
  // The widened input is structurally a vite-plus UserConfig once plugins are
  // accepted; bridge to vite-plus's narrower overloaded param here, not at the
  // call site.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  defineVitePlusConfig({
    ...config,
    plugins: [...(config.plugins ?? []), fsFix],
  } as unknown as UserConfig);

export { defineConfig };
export type { ToolingDefineConfigInput };

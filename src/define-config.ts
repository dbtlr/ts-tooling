import type { PluginOption } from 'vite';
import { defineConfig as defineVitePlusConfig } from 'vite-plus';
import type { UserConfig } from 'vite-plus';

// vite-plus's `defineConfig` is overloaded, and the overload resolution blows the
// type-checker's stack (TS2321) when `plugins` contains array-returning plugins like
// `@vitejs/plugin-react`. This single-signature delegate accepts `plugins` as vite's
// `PluginOption` and forwards to vite-plus, preserving guard-plugin injection while
// avoiding the overload-depth blowup. Temporary shim until vite-plus fixes its overloads.
type ToolingDefineConfigInput = Omit<UserConfig, 'plugins'> & {
  readonly plugins?: readonly PluginOption[];
};

const defineConfig = (config: ToolingDefineConfigInput): UserConfig =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  defineVitePlusConfig(config as unknown as UserConfig);

export { defineConfig };
export type { ToolingDefineConfigInput };

import { vitePlusMonorepo } from '@dbtlr/tooling/vite-plus';
import { defineConfig } from 'vite-plus';

// Centralized monorepo lint config.
//
// A root `pnpm-workspace.yaml` makes vite-plus treat this tree as ONE monorepo
// and centralize lint/fmt here — per-package `lint` blocks are ignored (only
// Vite/Vitest/build config is honored per package). So a mixed-target monorepo
// (a Node service + a browser React app) must express EACH target as a
// `files`-scoped override fragment in this single root config.
//
// NOTE the duplication: the React plugin list and its rule tweaks below are
// copies of what `lint: { react: true }` produces as whole-project config, and
// the Node override re-states `lint: { node: true }`. There is no first-class
// helper to emit these as override fragments yet — that gap is exactly what this
// example exists to expose. See README.md.
const REACT_PLUGINS = ['react', 'react-perf', 'jsx-a11y'];

export default defineConfig(
  vitePlusMonorepo({
    lint: {
      overrides: [
        {
          // Browser React package — enable the React plugins and relax the
          // rules that assume a classic runtime / kebab-case filenames.
          files: ['packages/web/**'],
          plugins: REACT_PLUGINS,
          rules: {
            'react/react-in-jsx-scope': 'off',
            'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
          },
        },
        {
          // Node service package — enable the `node` plugin and allow Node
          // builtins (forbidden by default for the browser-target baseline).
          files: ['packages/api/**'],
          plugins: ['node'],
          rules: {
            'import/no-nodejs-modules': 'off',
          },
        },
      ],
    },
  }),
);

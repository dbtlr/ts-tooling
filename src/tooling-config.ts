import { defineConfig } from 'vite-plus';

import { targetGlobs } from './helpers.js';
import type { LintTarget } from './helpers.js';
import { compactObject } from './types.js';
import type { JsonObject } from './types.js';
import { vitePlusBase, vitePlusPackage } from './vite-plus.js';
import type { VitePlusLintOptions } from './vite-plus.js';
import { viteReactApp } from './vite.js';
import { vitestNode, vitestReact } from './vitest.js';

type ToolingConfigOptions = {
  readonly node?: LintTarget;
  readonly react?: LintTarget;
  readonly test?: 'node' | 'react' | false;
  readonly pack?: JsonObject;
  readonly lint?: Omit<VitePlusLintOptions, 'node' | 'react'>;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

// A glob-scoped target (bare list or the object form's `files`, non-empty) marks a
// monorepo root: lint only, no test/vite — members own those. A bare `true` is the
// whole single project; an empty list is the target off (per the LintTarget
// contract), neither of which is a monorepo root. `targetGlobs` collapses all that
// to "has scoped globs?".
const isScopedTarget = (target: LintTarget | undefined): boolean =>
  targetGlobs(target) !== undefined;

const toolingConfig = (options: ToolingConfigOptions = {}) => {
  const { node, react, test, pack, lint, fmt, staged } = options;
  const scoped = isScopedTarget(node) || isScopedTarget(react);

  const baseOptions = compactObject({
    fmt,
    lint: { ...lint, node, react },
    staged,
  });
  const base =
    pack === undefined ? vitePlusBase(baseOptions) : vitePlusPackage({ ...baseOptions, pack });

  // Single-project react gets the vite react-app block; a monorepo root (any glob
  // target) does not — gated on `scoped` so it stays consistent with the test block.
  const viteApp = react === true && !scoped ? viteReactApp() : {};

  // Derive the test env from intent unless overridden; monorepo roots and
  // `test: false` carry no test block (members own their own test config).
  const testBlock = ((): JsonObject => {
    if (scoped || test === false) {
      return {};
    }
    const env = test ?? (react ? 'react' : 'node');
    return env === 'react' ? vitestReact() : vitestNode();
  })();

  return defineConfig({ ...base, ...viteApp, ...testBlock });
};

export { toolingConfig };
export type { ToolingConfigOptions };

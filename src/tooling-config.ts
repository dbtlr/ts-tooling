import { defineConfig } from 'vite-plus';

import { compactObject } from './types.js';
import type { JsonObject } from './types.js';
import { vitePlusBase, vitePlusPackage } from './vite-plus.js';
import type { VitePlusLintOptions } from './vite-plus.js';
import { viteReactApp } from './vite.js';
import { vitestNode, vitestReact } from './vitest.js';

type LintTarget = boolean | readonly string[];

type ToolingConfigOptions = {
  readonly node?: LintTarget;
  readonly react?: LintTarget;
  readonly test?: 'node' | 'react' | false;
  readonly pack?: JsonObject;
  readonly lint?: Omit<VitePlusLintOptions, 'node' | 'react'>;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

// A non-empty glob list scopes a target to a monorepo's packages; a bare `true`
// means the whole single project. Globs => this is a monorepo root: lint only, no
// test/vite. An empty list is the target being off (per the LintTarget contract),
// not a monorepo root, so it must not suppress the test/vite blocks.
const isScopedTarget = (target: LintTarget | undefined): boolean =>
  Array.isArray(target) && target.length > 0;

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

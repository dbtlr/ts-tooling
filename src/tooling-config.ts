import { defineConfig } from './define-config.js';
import type { ToolingDefineConfigInput } from './define-config.js';
import { fmt } from './fmt.js';
import { targetGlobs } from './helpers.js';
import type { LintTarget } from './helpers.js';
import { lint } from './lint.js';
import type { LintOptions } from './lint.js';
import { pack as packConfig } from './pack.js';
import { staged as stagedConfig } from './staged.js';
import { compactObject } from './types.js';
import type { JsonObject } from './types.js';
import { viteReactApp } from './vite.js';
import { testNode, testReact } from './vitest.js';

type ToolingConfigOptions = {
  readonly node?: LintTarget;
  readonly react?: LintTarget;
  readonly test?: 'node' | 'react' | false;
  readonly pack?: JsonObject;
  readonly lint?: Omit<LintOptions, 'node' | 'react'>;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

// A glob-scoped target marks a monorepo lint root: lint only, members own
// test/vite. `true` is the whole single project; an empty list is the target off.
const isScopedTarget = (target: LintTarget | undefined): boolean =>
  targetGlobs(target) !== undefined;

// Resolve the staged value: false → omit; object → pass through; else default.
const stagedValue = (staged: JsonObject | false | undefined): JsonObject | undefined => {
  if (staged === false) {
    return undefined;
  }
  if (typeof staged === 'object') {
    return staged;
  }
  return stagedConfig();
};

const toolingConfig = (options: ToolingConfigOptions = {}) => {
  const { node, react, test, pack, lint: lintOptions, fmt: fmtOptions, staged } = options;
  const scoped = isScopedTarget(node) || isScopedTarget(react);

  // Single-project react gets the vite react-app block; a monorepo root does not.
  const viteApp = react === true && !scoped ? viteReactApp() : {};

  // Test env derives from intent unless overridden; monorepo roots and `test: false`
  // carry no test block (members own their own test config).
  const testBlock = ((): JsonObject | undefined => {
    if (scoped || test === false) {
      return undefined;
    }
    const env = test ?? (react ? 'react' : 'node');
    return env === 'react' ? testReact() : testNode();
  })();

  return defineConfig(
    // JsonObject keys are structurally compatible with ToolingDefineConfigInput;
    // compactObject's return mirrors the input shape, so the bridge cast is safe.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    compactObject({
      ...viteApp,
      fmt: fmt(fmtOptions),
      lint: lint({ ...lintOptions, node, react }),
      pack: pack === undefined ? undefined : packConfig(pack),
      staged: stagedValue(staged),
      test: testBlock,
    }) as unknown as ToolingDefineConfigInput,
  );
};

export { toolingConfig };
export type { ToolingConfigOptions };

import { fmt } from './fmt.js';
import { lint } from './lint.js';
import type { LintOptions } from './lint.js';
import { pack } from './pack.js';
import { staged } from './staged.js';
import { compactObject } from './types.js';
import type { JsonObject } from './types.js';

type VitePlusPackageOptions = {
  readonly pack?: JsonObject;
  readonly lint?: LintOptions;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

const vitePlusBase = (options: VitePlusPackageOptions = {}): JsonObject =>
  compactObject({
    fmt: fmt(options.fmt),
    lint: lint(options.lint),
    staged:
      options.staged === false
        ? undefined
        : staged(typeof options.staged === 'object' ? options.staged : {}),
  });

const vitePlusPackage = (options: VitePlusPackageOptions = {}): JsonObject => ({
  ...vitePlusBase(options),
  pack: pack(options.pack),
});

export { vitePlusBase, vitePlusPackage };
export type { LintTarget, ScopedTarget } from './helpers.js';
export type { LintOverride, LintOptions } from './lint.js';
export type { VitePlusPackageOptions };

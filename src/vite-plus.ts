import type { UserConfig } from 'vite-plus';

import { isWholeProject, targetGlobs, targetRules } from './helpers.js';
import type { LintTarget } from './helpers.js';
import { compactObject } from './types.js';
import type { JsonObject } from './types.js';

// A single oxlint override entry, derived from vite-plus's public config type so
// it stays in lockstep with the toolchain (rather than a hand-rolled copy that
// drifts). Lets a consumer pass a typed override to `lint.overrides` without an
// `as unknown as JsonObject[]` cast.
type LintOverride = NonNullable<NonNullable<UserConfig['lint']>['overrides']>[number];

type VitePlusLintOptions = {
  readonly typeAware?: boolean;
  readonly typeCheck?: boolean;
  readonly denyWarnings?: boolean;
  readonly maxWarnings?: number;
  readonly ignores?: readonly string[];
  readonly node?: LintTarget;
  readonly react?: LintTarget;
  readonly rules?: JsonObject;
  readonly overrides?: readonly LintOverride[];
};

// oxlint plugins enabled for a React target; the `react` plugin also carries the
// rules-of-hooks / exhaustive-deps checks.
const REACT_PLUGINS = ['react', 'react-perf', 'jsx-a11y'] as const;

// The rule tweaks a React target needs: the modern automatic JSX runtime (no
// in-scope React import), PascalCase component filenames, and two relaxed
// defaults that are react-plugin rules (so they live here, only emitted when the
// react plugin is loaded — both whole-project and glob-scoped).
const REACT_RULES: JsonObject = {
  'react/jsx-max-depth': 'off',
  'react/jsx-props-no-spreading': 'off',
  'react/react-in-jsx-scope': 'off',
  'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
};

// oxlint plugins enabled for a Node target.
const NODE_PLUGINS = ['node'] as const;

// The rule a Node target needs: allow Node builtins (forbidden by the browser
// baseline). Enabled alongside the `node` plugin. Consumed by both the
// whole-project and glob-scoped node paths so they can't drift.
const NODE_RULES: JsonObject = {
  'import/no-nodejs-modules': 'off',
};

// Too-opinionated, runtime-agnostic rules turned off as house defaults,
// dogfooded from real projects — they flag style preferences, not correctness.
// Re-enable any per-project via `lint.rules`. (React-plugin relaxations live in
// REACT_RULES so they only emit when the react plugin is loaded;
// typescript/consistent-type-definitions stays on, pinned to `type`.) Keys
// sorted for sort-keys; spread into the base rules so they don't interleave.
const RELAXED_DEFAULTS: JsonObject = {
  'func-style': 'off',
  'id-length': 'off',
  'import/exports-last': 'off',
  'import/group-exports': 'off',
  'init-declarations': 'off',
  'max-params': 'off',
  'max-statements': 'off',
  'no-continue': 'off',
  'prefer-destructuring': 'off',
  'prefer-named-capture-group': 'off',
  'unicorn/catch-error-name': 'off',
  'unicorn/no-await-expression-member': 'off',
  'unicorn/numeric-separators-style': 'off',
};

// Build the scoped `overrides` fragment for a glob-targeted plugin set + rules.
const scopedOverride = (
  globs: readonly string[],
  plugins: readonly string[],
  rules: JsonObject,
): JsonObject => ({ files: [...globs], plugins: [...plugins], rules: { ...rules } });

type VitePlusPackageOptions = {
  readonly pack?: JsonObject;
  readonly lint?: VitePlusLintOptions;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

const vitePlusLint = (options: VitePlusLintOptions = {}): JsonObject => {
  const nodeWhole = isWholeProject(options.node);
  const reactWhole = isWholeProject(options.react);
  const nodeGlobs = targetGlobs(options.node);
  const reactGlobs = targetGlobs(options.react);

  // Glob-scoped targets become `overrides` fragments; they precede the standing
  // test-file override and any caller-supplied overrides.
  const targetOverrides: JsonObject[] = [
    ...(nodeGlobs
      ? [scopedOverride(nodeGlobs, NODE_PLUGINS, { ...NODE_RULES, ...targetRules(options.node) })]
      : []),
    ...(reactGlobs
      ? [
          scopedOverride(reactGlobs, REACT_PLUGINS, {
            ...REACT_RULES,
            ...targetRules(options.react),
          }),
        ]
      : []),
  ];

  return {
    categories: {
      correctness: 'error',
      nursery: 'off',
      pedantic: 'off',
      perf: 'error',
      restriction: 'off',
      style: 'warn',
      suspicious: 'error',
    },
    ignorePatterns: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.turbo',
      '.vite',
      ...(options.ignores ?? []),
    ],
    // Strict by default: warnings fail, and type-aware lint + type checking run.
    // This is the house gate; opt out of any of them per-flag with `false`.
    options: compactObject({
      denyWarnings: options.denyWarnings ?? true,
      maxWarnings: options.maxWarnings,
      typeAware: options.typeAware ?? true,
      typeCheck: options.typeCheck ?? true,
    }),
    overrides: [
      ...targetOverrides,
      {
        files: [
          'tests/**/*.ts',
          'tests/**/*.tsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
        ],
        rules: {
          'max-statements': 'off',
          // Over-opinionated test rules relaxed in test scope only — dogfooded
          // from a real adopter. Most are test-structure style (max-expects,
          // no-hooks, require-hook, require-top-level-describe); require-mock-
          // type-parameters is oxlint-categorized correctness but in practice
          // just enforces explicit mock type params, an ergonomic preference.
          // The three prefer-* are relaxed because their "safe" autofix is
          // behavior-/type-breaking: prefer-called-with drops the exactly-zero-
          // args assertion, prefer-describe-function-title passes a non-function
          // title, prefer-import-in-mock flips the mock overload.
          'vitest/max-expects': 'off',
          'vitest/no-hooks': 'off',
          'vitest/no-importing-vitest-globals': 'off',
          'vitest/prefer-called-with': 'off',
          'vitest/prefer-describe-function-title': 'off',
          'vitest/prefer-expect-assertions': 'off',
          'vitest/prefer-import-in-mock': 'off',
          'vitest/prefer-importing-vitest-globals': 'off',
          'vitest/require-hook': 'off',
          'vitest/require-mock-type-parameters': 'off',
          'vitest/require-top-level-describe': 'off',
        },
      },
      // LintOverride is the typed consumer surface; oxlint overrides are JSON
      // data lacking only an index signature, so bridge to JsonObject internally.
      // The cast lives here, not on the consumer's call site — the whole point of
      // the typed option.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      ...((options.overrides ?? []) as unknown as readonly JsonObject[]),
    ],
    plugins: [
      'typescript',
      'import',
      'eslint',
      'unicorn',
      'oxc',
      'promise',
      'vitest',
      // Whole-project targets enable plugins here; glob-scoped targets enable them
      // in their `overrides` fragment instead (see targetOverrides).
      ...(nodeWhole ? NODE_PLUGINS : []),
      ...(reactWhole ? REACT_PLUGINS : []),
    ],
    rules: {
      'capitalized-comments': 'off',
      'import/no-named-export': 'off',
      // Browser baseline forbids Node builtins; a whole-project node target lifts
      // this via NODE_RULES below, a glob-scoped one only inside its override.
      'import/no-nodejs-modules': 'error',
      // Named exports are the house style (see import/no-named-export above), so
      // don't nudge single-export modules toward a default export.
      'import/prefer-default-export': 'off',
      'no-duplicate-imports': ['warn', { allowSeparateTypeImports: true }],
      'no-magic-numbers': 'off',
      'no-ternary': 'off',
      'sort-imports': 'off',
      'typescript/consistent-type-definitions': ['warn', 'type'],
      'unicorn/no-null': 'off',
      // Ternaries are allowed (no-ternary off) but not forced; prefer-ternary would
      // rewrite else-if chains into nested ternaries, conflicting with unicorn/no-nested-ternary.
      'unicorn/prefer-ternary': 'off',
      'vitest/prefer-importing-vitest-globals': 'off',
      // Conflicts with vitest/prefer-strict-boolean-matchers; prefer strict toBe(true|false).
      // Disabled at base (not just in test files) so the conflict can't fire anywhere.
      'vitest/prefer-to-be-falsy': 'off',
      'vitest/prefer-to-be-truthy': 'off',
      // Spread (not inline) so these stay grouped with their rationale and don't
      // have to interleave alphabetically with the keys above (sort-keys).
      ...RELAXED_DEFAULTS,
      // Whole-project targets only; glob-scoped rules live in their overrides.
      // Spread last so a whole-project node target overrides the baseline above.
      ...(nodeWhole ? NODE_RULES : {}),
      ...(reactWhole ? REACT_RULES : {}),
      ...options.rules,
    },
  };
};

const vitePlusBase = (options: VitePlusPackageOptions = {}): JsonObject =>
  compactObject({
    fmt: {
      ignorePatterns: [
        'pnpm-lock.yaml',
        'bun.lock',
        // Generated by release-please/changesets — let the release tool own its
        // format instead of fighting it on every release PR.
        'CHANGELOG.md',
        'dist/**',
        'build/**',
        'node_modules/**',
        'coverage/**',
        '.turbo/**',
        '.vite/**',
      ],
      singleQuote: true,
      sortImports: { ignoreCase: true },
      ...options.fmt,
    },
    lint: vitePlusLint(options.lint),
    staged: options.staged === false ? undefined : (options.staged ?? { '*': 'vp check --fix' }),
  });

const vitePlusPackage = (options: VitePlusPackageOptions = {}): JsonObject => ({
  ...vitePlusBase(options),
  pack: {
    dts: { tsgo: true },
    exports: true,
    ...options.pack,
  },
});

export { vitePlusBase, vitePlusPackage };
export type { LintTarget, ScopedTarget } from './helpers.js';
export type { LintOverride, VitePlusLintOptions, VitePlusPackageOptions };

import { compactObject } from './types.js';
import type { JsonObject } from './types.js';

// A lint target — `node` or `react` — is a set of files the target applies to.
// `true` means the whole project (config emitted at the top level); a list of
// globs means just those files (config emitted as a scoped `overrides` fragment),
// which is how a mixed-target monorepo's centralized root config addresses each
// package. `false`/omitted/`[]` means the target is off.
type LintTarget = boolean | readonly string[];

type VitePlusLintOptions = {
  readonly typeAware?: boolean;
  readonly typeCheck?: boolean;
  readonly denyWarnings?: boolean;
  readonly maxWarnings?: number;
  readonly ignores?: readonly string[];
  readonly node?: LintTarget;
  readonly react?: LintTarget;
  readonly rules?: JsonObject;
  readonly overrides?: readonly JsonObject[];
};

// oxlint plugins enabled for a React target; the `react` plugin also carries the
// rules-of-hooks / exhaustive-deps checks.
const REACT_PLUGINS = ['react', 'react-perf', 'jsx-a11y'] as const;

// The rule tweaks a React target needs: the modern automatic JSX runtime (no
// in-scope React import) and PascalCase component filenames.
const REACT_RULES: JsonObject = {
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

// A target is "whole project" only when explicitly `true`.
const isWholeProject = (target: LintTarget | undefined): boolean => target === true;

// Non-empty glob list → the target is scoped to those files; otherwise undefined.
const targetGlobs = (target: LintTarget | undefined): readonly string[] | undefined =>
  Array.isArray(target) && target.length > 0 ? target : undefined;

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
    ...(nodeGlobs ? [scopedOverride(nodeGlobs, NODE_PLUGINS, NODE_RULES)] : []),
    ...(reactGlobs ? [scopedOverride(reactGlobs, REACT_PLUGINS, REACT_RULES)] : []),
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
          'vitest/no-importing-vitest-globals': 'off',
          'vitest/prefer-expect-assertions': 'off',
          'vitest/prefer-importing-vitest-globals': 'off',
        },
      },
      ...(options.overrides ?? []),
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
export type { VitePlusLintOptions, VitePlusPackageOptions };

import { compactObject } from './types.js';
import type { JsonObject } from './types.js';

type VitePlusLintOptions = {
  readonly typeAware?: boolean;
  readonly typeCheck?: boolean;
  readonly denyWarnings?: boolean;
  readonly maxWarnings?: number;
  readonly ignores?: readonly string[];
  readonly node?: boolean;
  readonly react?: boolean;
  readonly rules?: JsonObject;
  readonly overrides?: readonly JsonObject[];
};

// oxlint plugins enabled when `react: true`; the `react` plugin also carries the
// rules-of-hooks / exhaustive-deps checks.
const REACT_PLUGINS = ['react', 'react-perf', 'jsx-a11y'] as const;

type VitePlusPackageOptions = {
  readonly pack?: JsonObject;
  readonly lint?: VitePlusLintOptions;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

const vitePlusLint = (options: VitePlusLintOptions = {}): JsonObject => ({
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
  options: compactObject({
    denyWarnings: options.denyWarnings,
    maxWarnings: options.maxWarnings,
    typeAware: options.typeAware,
    typeCheck: options.typeCheck,
  }),
  overrides: [
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
    ...(options.node ? ['node'] : []),
    ...(options.react ? REACT_PLUGINS : []),
  ],
  rules: {
    'capitalized-comments': 'off',
    'import/no-named-export': 'off',
    // Forbid Node builtins for browser targets; allow them only when lint.node is set.
    'import/no-nodejs-modules': options.node ? 'off' : 'error',
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
    ...(options.react
      ? {
          // React 17+ automatic JSX runtime — no in-scope React import needed.
          'react/react-in-jsx-scope': 'off',
          // Allow PascalCase component filenames (e.g. App.tsx) alongside kebab-case.
          'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
        }
      : {}),
    ...options.rules,
  },
});

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

const vitePlusMonorepo = (options: VitePlusPackageOptions = {}): JsonObject =>
  vitePlusBase({
    ...options,
    lint: {
      denyWarnings: true,
      typeAware: true,
      typeCheck: true,
      ...options.lint,
    },
  });

export { vitePlusBase, vitePlusMonorepo, vitePlusPackage };
export type { VitePlusLintOptions, VitePlusPackageOptions };

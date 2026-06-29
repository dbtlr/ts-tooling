import { describe, expect, it } from 'vite-plus/test';

import { vitePlusBase, vitePlusPackage } from '../src/vite-plus.js';
import type { LintOverride } from '../src/vite-plus.js';

describe('vite-plus presets', () => {
  it('builds a base config with fmt, lint, and staged blocks', () => {
    const config = vitePlusBase();

    expect(config.fmt).toBeDefined();
    expect(config.lint).toBeDefined();
    expect(config.staged).toStrictEqual({ '*': 'vp check --fix' });
  });

  it('adds a pack block for packages', () => {
    const config = vitePlusPackage({ pack: { entry: ['src/index.ts'] } });

    expect(config.pack).toMatchObject({ entry: ['src/index.ts'], exports: true });
  });

  it('disables staged when explicitly set to false', () => {
    expect(vitePlusBase({ staged: false }).staged).toBeUndefined();
  });

  it('includes the vitest test-file overrides in lint', () => {
    expect(vitePlusBase().lint).toMatchObject({
      overrides: [{ rules: { 'vitest/no-importing-vitest-globals': 'off' } }],
    });
  });

  it('resolves the ternary and boolean-matcher conflicts at base lint scope', () => {
    expect(vitePlusBase().lint).toMatchObject({
      rules: {
        'no-ternary': 'off',
        'unicorn/prefer-ternary': 'off',
        'vitest/prefer-to-be-falsy': 'off',
        'vitest/prefer-to-be-truthy': 'off',
      },
    });
  });

  it('is strict by default: warnings fail, type-aware lint and type checking run', () => {
    expect(vitePlusBase().lint).toMatchObject({
      options: { denyWarnings: true, typeAware: true, typeCheck: true },
    });
  });

  it('lets a consumer opt out of a strict default per-flag', () => {
    expect(vitePlusBase({ lint: { typeCheck: false } }).lint).toMatchObject({
      options: { denyWarnings: true, typeAware: true, typeCheck: false },
    });
  });

  it('omits react plugins and rules by default', () => {
    expect(vitePlusBase().lint).toMatchObject({
      plugins: expect.not.arrayContaining(['react', 'react-perf', 'jsx-a11y']),
      rules: expect.not.objectContaining({ 'react/react-in-jsx-scope': 'off' }),
    });
  });

  it('defaults to a browser target: no node plugin, node builtins forbidden', () => {
    expect(vitePlusBase().lint).toMatchObject({
      plugins: expect.not.arrayContaining(['node']),
      rules: { 'import/no-nodejs-modules': 'error' },
    });
  });

  it('adds the node plugin and allows node builtins when node is enabled', () => {
    expect(vitePlusPackage({ lint: { node: true } }).lint).toMatchObject({
      plugins: expect.arrayContaining(['node']),
      rules: { 'import/no-nodejs-modules': 'off' },
    });
  });

  it('combines node and react flags for an isomorphic target', () => {
    expect(vitePlusPackage({ lint: { node: true, react: true } }).lint).toMatchObject({
      plugins: expect.arrayContaining(['node', 'react', 'react-perf', 'jsx-a11y']),
      rules: {
        'import/no-nodejs-modules': 'off',
        'react/react-in-jsx-scope': 'off',
      },
    });
  });

  it('adds react plugins and modern-JSX rule overrides when react is enabled', () => {
    expect(vitePlusPackage({ lint: { react: true } }).lint).toMatchObject({
      plugins: expect.arrayContaining(['react', 'react-perf', 'jsx-a11y']),
      rules: { 'react/react-in-jsx-scope': 'off' },
    });
  });

  it('disables prefer-default-export to match the named-export house style', () => {
    expect(vitePlusBase().lint).toMatchObject({
      rules: { 'import/prefer-default-export': 'off' },
    });
  });

  it('allows PascalCase component filenames under react', () => {
    expect(vitePlusPackage({ lint: { react: true } }).lint).toMatchObject({
      rules: {
        'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
      },
    });
  });

  it('scopes node to globs via an override, keeping the base browser target', () => {
    const { lint } = vitePlusBase({ lint: { node: ['packages/api/**'] } });

    // Base stays browser: no top-level node plugin, builtins still forbidden.
    expect(lint).toMatchObject({
      plugins: expect.not.arrayContaining(['node']),
      rules: { 'import/no-nodejs-modules': 'error' },
    });
    // The override allows builtins only for the matched files.
    expect(lint).toMatchObject({
      overrides: expect.arrayContaining([
        {
          files: ['packages/api/**'],
          plugins: ['node'],
          rules: { 'import/no-nodejs-modules': 'off' },
        },
      ]),
    });
  });

  it('scopes react to globs via an override, keeping the base free of react', () => {
    const { lint } = vitePlusBase({ lint: { react: ['packages/web/**'] } });

    expect(lint).toMatchObject({
      plugins: expect.not.arrayContaining(['react', 'react-perf', 'jsx-a11y']),
      rules: expect.not.objectContaining({ 'react/react-in-jsx-scope': 'off' }),
    });
    expect(lint).toMatchObject({
      overrides: expect.arrayContaining([
        {
          files: ['packages/web/**'],
          plugins: ['react', 'react-perf', 'jsx-a11y'],
          rules: {
            'react/jsx-max-depth': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/react-in-jsx-scope': 'off',
            'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
          },
        },
      ]),
    });
  });

  it('folds object-form react rules into the same scoped override (consumer wins)', () => {
    const { lint } = vitePlusBase({
      lint: {
        react: {
          files: ['packages/ui/**'],
          // jsx-max-depth collides with a REACT_RULES default (off) — the consumer
          // value must win because both live in the SAME override (no ordering dep).
          rules: { 'react-perf/jsx-no-new-function-as-prop': 'off', 'react/jsx-max-depth': 'warn' },
        },
      },
    });

    expect(lint).toMatchObject({
      overrides: expect.arrayContaining([
        expect.objectContaining({
          files: ['packages/ui/**'],
          plugins: ['react', 'react-perf', 'jsx-a11y'],
          rules: expect.objectContaining({
            'react-perf/jsx-no-new-function-as-prop': 'off', // consumer addition
            'react/jsx-max-depth': 'warn', // consumer override wins over REACT_RULES 'off'
            'react/react-in-jsx-scope': 'off', // target rule still present
          }),
        }),
      ]),
    });
  });

  it('folds object-form node rules into the same scoped override', () => {
    const { lint } = vitePlusBase({
      lint: { node: { files: ['packages/api/**'], rules: { 'no-console': 'off' } } },
    });

    expect(lint).toMatchObject({
      overrides: expect.arrayContaining([
        expect.objectContaining({
          files: ['packages/api/**'],
          plugins: ['node'],
          rules: expect.objectContaining({
            'import/no-nodejs-modules': 'off', // target rule still present
            'no-console': 'off', // consumer addition
          }),
        }),
      ]),
    });
  });

  it('mixes a whole-project node target with a glob-scoped react target', () => {
    const { lint } = vitePlusBase({ lint: { node: true, react: ['packages/web/**'] } });

    // node: true is whole-project (top-level), react is scoped (override only).
    expect(lint).toMatchObject({
      plugins: expect.arrayContaining(['node']),
      rules: { 'import/no-nodejs-modules': 'off' },
    });
    expect(lint).toMatchObject({
      overrides: expect.arrayContaining([expect.objectContaining({ files: ['packages/web/**'] })]),
      plugins: expect.not.arrayContaining(['react']),
    });
  });

  it('excludes the generated CHANGELOG from formatting', () => {
    // release-please/changesets own the CHANGELOG's format; oxfmt must not fight it.
    expect(vitePlusBase().fmt).toMatchObject({
      ignorePatterns: expect.arrayContaining(['CHANGELOG.md']),
    });
  });

  it('turns off the runtime-agnostic too-opinionated rules by default', () => {
    expect(vitePlusBase().lint).toMatchObject({
      rules: {
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
      },
    });
  });

  it('relaxes the too-opinionated and unsafe-autofix vitest rules in the test override', () => {
    expect(vitePlusBase().lint).toMatchObject({
      overrides: expect.arrayContaining([
        expect.objectContaining({
          files: expect.arrayContaining(['**/*.test.ts']),
          // Too-opinionated test-style rules + the three unsafe-autofix ones.
          rules: expect.objectContaining({
            'vitest/max-expects': 'off',
            'vitest/no-hooks': 'off',
            'vitest/prefer-called-with': 'off',
            'vitest/prefer-describe-function-title': 'off',
            'vitest/prefer-import-in-mock': 'off',
            'vitest/require-hook': 'off',
            'vitest/require-mock-type-parameters': 'off',
            'vitest/require-top-level-describe': 'off',
          }),
        }),
      ]),
    });
  });

  it('keeps the react relaxations out of a non-react base', () => {
    expect(vitePlusBase().lint).toMatchObject({
      rules: expect.not.objectContaining({ 'react/jsx-max-depth': 'off' }),
    });
  });

  it('relaxes the react rules only when a react target is enabled', () => {
    expect(vitePlusPackage({ lint: { react: true } }).lint).toMatchObject({
      rules: { 'react/jsx-max-depth': 'off', 'react/jsx-props-no-spreading': 'off' },
    });
  });

  it('keeps consistent-type-definitions pinned to type (oxlint defaults to interface)', () => {
    expect(vitePlusBase().lint).toMatchObject({
      rules: { 'typescript/consistent-type-definitions': ['warn', 'type'] },
    });
  });

  it('keeps the deliberately-enabled rules on, guarding against silent relaxation', () => {
    // sort-keys (style), no-await-in-loop (perf), and vitest/valid-title
    // (correctness) are on via oxlint's category defaults, not explicit entries.
    // A future relaxation could disable them with no other test failing — guard
    // that they are never turned off at base or in any override.
    expect(vitePlusBase().lint).toMatchObject({
      overrides: expect.not.arrayContaining([
        expect.objectContaining({
          rules: expect.objectContaining({ 'vitest/valid-title': 'off' }),
        }),
      ]),
      rules: expect.not.objectContaining({
        'no-await-in-loop': 'off',
        'sort-keys': 'off',
        'vitest/valid-title': 'off',
      }),
    });
  });

  it('passes a typed lint.overrides entry through with no cast', () => {
    // LintOverride is the exported, derived type; a typed fragment must assign
    // without `as unknown as JsonObject[]` and flow through to the config.
    const override: LintOverride = { files: ['scripts/**'], rules: { 'no-console': 'off' } };

    expect(vitePlusBase({ lint: { overrides: [override] } }).lint).toMatchObject({
      overrides: expect.arrayContaining([override]),
    });
  });

  it('treats an empty glob list as no target', () => {
    const { lint } = vitePlusBase({ lint: { node: [], react: [] } });

    expect(lint).toMatchObject({
      // No target fragment is prepended: index 0 is still the test-file override.
      overrides: [{ rules: { 'vitest/no-importing-vitest-globals': 'off' } }],
      plugins: expect.not.arrayContaining(['node', 'react']),
      rules: { 'import/no-nodejs-modules': 'error' },
    });
  });
});

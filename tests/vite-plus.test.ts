import { describe, expect, it } from 'vite-plus/test';

import { vitePlusBase, vitePlusMonorepo, vitePlusPackage } from '../src/vite-plus.js';

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

  it('enables type-aware checks and denyWarnings for monorepo', () => {
    expect(vitePlusMonorepo().lint).toMatchObject({
      options: { denyWarnings: true, typeAware: true, typeCheck: true },
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
            'react/react-in-jsx-scope': 'off',
            'unicorn/filename-case': ['warn', { cases: { kebabCase: true, pascalCase: true } }],
          },
        },
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

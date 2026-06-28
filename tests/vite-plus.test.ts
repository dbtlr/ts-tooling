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

  it('adds react plugins and modern-JSX rule overrides when react is enabled', () => {
    expect(vitePlusPackage({ lint: { react: true } }).lint).toMatchObject({
      plugins: expect.arrayContaining(['react', 'react-perf', 'jsx-a11y']),
      rules: { 'react/react-in-jsx-scope': 'off' },
    });
  });
});

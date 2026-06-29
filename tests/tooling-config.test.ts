import { describe, expect, it } from 'vite-plus/test';

import { toolingConfig } from '../src/tooling-config.js';

describe('toolingConfig composition', () => {
  it('places lint and fmt as value-form keys', () => {
    const config = toolingConfig({ node: true });
    expect(config.lint).toMatchObject({ options: { denyWarnings: true } });
    expect(config.fmt).toMatchObject({ singleQuote: true });
  });

  it('derives a node test block by default', () => {
    expect(toolingConfig().test).toMatchObject({ environment: 'node' });
  });

  it('derives a react test block and a vite app block for react: true', () => {
    const config = toolingConfig({ react: true });
    expect(config.test).toMatchObject({ environment: 'jsdom' });
    expect(config).toHaveProperty('plugins');
  });

  it('a glob (monorepo-lint-root) target emits lint only — no test or pack', () => {
    const config = toolingConfig({ node: ['packages/api/**'] });
    expect(config).not.toHaveProperty('test');
    expect(config).not.toHaveProperty('pack');
  });

  it('omits the test block when test: false', () => {
    expect(toolingConfig({ test: false })).not.toHaveProperty('test');
  });

  it('adds a pack block only when pack is provided', () => {
    expect(toolingConfig()).not.toHaveProperty('pack');
    expect(toolingConfig({ pack: {} }).pack).toMatchObject({ exports: true });
  });

  it('staged: false omits the staged block', () => {
    expect(toolingConfig({ staged: false })).not.toHaveProperty('staged');
  });
});

describe('the toolingConfig helper', () => {
  it('a node project: node lint target + node test env, no pack', () => {
    const config = toolingConfig({ node: true });
    expect(config.lint).toMatchObject({ rules: { 'import/no-nodejs-modules': 'off' } });
    expect(config.test).toMatchObject({ environment: 'node' });
    expect(config.pack).toBeUndefined();
  });

  it('a react app: react lint + jsdom test', () => {
    const config = toolingConfig({ react: true });
    expect(config.lint).toMatchObject({ rules: { 'react/react-in-jsx-scope': 'off' } });
    expect(config.test).toMatchObject({ environment: 'jsdom' });
  });

  it('isomorphic (node + react): both targets, jsdom test', () => {
    const config = toolingConfig({ node: true, react: true });
    expect(config.lint).toMatchObject({ plugins: expect.arrayContaining(['node', 'react']) });
    expect(config.test).toMatchObject({ environment: 'jsdom' });
  });

  it('a package: pack present adds the pack block', () => {
    const config = toolingConfig({ pack: { entry: ['src/index.ts'] } });
    expect(config.pack).toMatchObject({ entry: ['src/index.ts'], exports: true });
  });

  it('monorepo root: glob targets give scoped lint overrides, no test/vite blocks', () => {
    const config = toolingConfig({ node: ['packages/api/**'], react: ['packages/web/**'] });
    expect(config.lint).toMatchObject({
      overrides: expect.arrayContaining([
        expect.objectContaining({ files: ['packages/api/**'] }),
        expect.objectContaining({ files: ['packages/web/**'] }),
      ]),
    });
    expect(config.test).toBeUndefined();
  });

  it('object-form glob target is a scoped monorepo root: scoped override, no test block', () => {
    const config = toolingConfig({
      react: { files: ['packages/web/**'], rules: { 'react/jsx-max-depth': 'warn' } },
    });
    expect(config.lint).toMatchObject({
      overrides: expect.arrayContaining([
        expect.objectContaining({
          files: ['packages/web/**'],
          rules: expect.objectContaining({ 'react/jsx-max-depth': 'warn' }),
        }),
      ]),
    });
    expect(config.test).toBeUndefined();
  });

  it('test override: test:false omits the test block; test:"node" forces node env', () => {
    expect(toolingConfig({ react: true, test: false }).test).toBeUndefined();
    expect(toolingConfig({ react: true, test: 'node' }).test).toMatchObject({
      environment: 'node',
    });
  });

  it('a package with a node target: pack block + node test env coexist (cli shape)', () => {
    const config = toolingConfig({ node: true, pack: { entry: ['src/cli.ts'] } });
    expect(config.pack).toMatchObject({ entry: ['src/cli.ts'] });
    expect(config.test).toMatchObject({ environment: 'node' });
    expect(config.lint).toMatchObject({ rules: { 'import/no-nodejs-modules': 'off' } });
  });

  it('mixed boolean + glob targets: any glob means monorepo root (no test/vite blocks)', () => {
    const config = toolingConfig({ node: true, react: ['packages/web/**'] });
    // node:true is still a whole-project lint target...
    expect(config.lint).toMatchObject({ plugins: expect.arrayContaining(['node']) });
    // ...but a glob anywhere marks a monorepo root: no project-wide test block.
    expect(config.test).toBeUndefined();
  });

  it('an empty glob target is "off", not a monorepo root, so the test block stays', () => {
    // Per the LintTarget contract, `[]` means the target is off — it must not be
    // mistaken for a glob list (monorepo root), which would drop the test block.
    expect(toolingConfig({ node: [] }).test).toMatchObject({ environment: 'node' });
  });

  it('passes staged through and disables it with staged:false', () => {
    expect(toolingConfig({ node: true }).staged).toStrictEqual({ '*': 'vp check --fix' });
    expect(toolingConfig({ node: true, staged: false }).staged).toBeUndefined();
  });

  it('strict-by-default carries through', () => {
    expect(toolingConfig({ node: true }).lint).toMatchObject({
      options: { denyWarnings: true, typeAware: true, typeCheck: true },
    });
  });

  it('lint overrides merge (e.g. extra ignores)', () => {
    const config = toolingConfig({ lint: { ignores: ['vendor'] }, node: true });
    expect(config.lint).toMatchObject({ ignorePatterns: expect.arrayContaining(['vendor']) });
  });
});

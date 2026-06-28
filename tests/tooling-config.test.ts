import { describe, expect, it } from 'vite-plus/test';

import { toolingConfig } from '../src/tooling-config.js';

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

  it('test override: test:false omits the test block; test:"node" forces node env', () => {
    expect(toolingConfig({ react: true, test: false }).test).toBeUndefined();
    expect(toolingConfig({ react: true, test: 'node' }).test).toMatchObject({
      environment: 'node',
    });
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

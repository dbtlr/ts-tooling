import { describe, expect, it } from 'vite-plus/test';

import { domSetup } from '../src/dom-setup.js';

describe('domSetup', () => {
  it('is a named vite plugin', () => {
    expect(domSetup().name).toBe('@dbtlr/tooling:dom-setup');
  });

  it('contributes the jest-dom setup file via config()', () => {
    const contributed = domSetup().config();
    expect(contributed).toMatchObject({ test: { setupFiles: ['@dbtlr/tooling/setup/dom'] } });
  });

  it('allows the tooling root for the fs server (for link: installs)', () => {
    const contributed = domSetup().config();
    expect(contributed.server.fs.allow).toHaveLength(1);
    expect(contributed.server.fs.allow[0]).toBeTypeOf('string');
  });
});

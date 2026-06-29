import { describe, expect, it } from 'vite-plus/test';

import { lint } from '../src/lint.js';

describe('lint', () => {
  it('is strict by default', () => {
    expect(lint().options).toMatchObject({ denyWarnings: true, typeAware: true, typeCheck: true });
  });

  it('enables the node plugin for a whole-project node target', () => {
    expect(lint({ node: true }).plugins).toContain('node');
  });

  it('emits a files-scoped override for a glob node target', () => {
    expect(lint({ node: ['packages/api/**'] })).toMatchObject({
      overrides: expect.arrayContaining([expect.objectContaining({ files: ['packages/api/**'] })]),
    });
  });

  it('keeps consistent-type-definitions pinned to type', () => {
    expect(lint()).toMatchObject({
      rules: { 'typescript/consistent-type-definitions': ['warn', 'type'] },
    });
  });
});

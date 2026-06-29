import { describe, expect, it } from 'vite-plus/test';

import { staged } from '../src/staged.js';

describe('staged', () => {
  it('defaults to running vp check --fix on every staged file', () => {
    expect(staged()).toStrictEqual({ '*': 'vp check --fix' });
  });

  it('merges caller commands over the default', () => {
    expect(staged({ '*.md': 'vp fmt' })).toMatchObject({ '*': 'vp check --fix', '*.md': 'vp fmt' });
  });
});

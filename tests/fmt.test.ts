import { describe, expect, it } from 'vite-plus/test';

import { fmt } from '../src/fmt.js';

describe('fmt', () => {
  it('returns the house defaults', () => {
    expect(fmt()).toMatchObject({ singleQuote: true, sortImports: { ignoreCase: true } });
  });

  it('ignores CHANGELOG.md and lockfiles by default', () => {
    expect(fmt().ignorePatterns).toStrictEqual(
      expect.arrayContaining(['CHANGELOG.md', 'pnpm-lock.yaml', 'bun.lock', 'dist/**']),
    );
  });

  it('merges caller options over the defaults', () => {
    expect(fmt({ singleQuote: false })).toMatchObject({ singleQuote: false });
  });
});

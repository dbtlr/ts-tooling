import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_FMT_IGNORES, fmt } from '../src/fmt.js';

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

  it('appends ignores to the house defaults instead of replacing them', () => {
    // The whole point of the `ignores` option: a caller adds a path without
    // having to re-list (or lose) the house defaults. Regression guard against
    // the old `ignorePatterns` passthrough that clobbered them.
    const patterns = fmt({ ignores: ['generated/**', 'vendor/**'] }).ignorePatterns;
    expect(patterns).toStrictEqual([...DEFAULT_FMT_IGNORES, 'generated/**', 'vendor/**']);
  });

  it('still ignores the house defaults even when caller ignores are given', () => {
    expect(fmt({ ignores: ['generated/**'] }).ignorePatterns).toStrictEqual(
      expect.arrayContaining(['CHANGELOG.md', 'generated/**']),
    );
  });
});

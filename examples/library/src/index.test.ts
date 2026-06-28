import { describe, expect, it } from 'vite-plus/test';

import { sum } from './index.js';

describe('summing values', () => {
  it('adds the values', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });

  it('returns 0 for an empty list', () => {
    expect(sum([])).toBe(0);
  });
});

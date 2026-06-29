import { describe, expect, it } from 'vite-plus/test';

import { add } from './legacy.js';

describe('adopting', () => {
  it('adds', () => {
    expect(add(1, 2)).toBe(3);
  });
});

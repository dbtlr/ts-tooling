import { describe, expect, it } from 'vite-plus/test';

import { run } from './cli.js';

describe('cli', () => {
  it('greets the provided name', () => {
    expect(run(['ada'])).toBe('hello, ada');
  });

  it('defaults to world', () => {
    expect(run([])).toBe('hello, world');
  });
});

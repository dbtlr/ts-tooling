import { describe, expect, it } from 'vite-plus/test';

import { server } from './server.js';

describe('node-server', () => {
  it('creates a server that is not yet listening', () => {
    expect(server.listening).toBe(false);
  });
});

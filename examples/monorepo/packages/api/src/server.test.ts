import { describe, expect, it } from 'vite-plus/test';

import { server } from './server.js';

describe('the api server', () => {
  it('creates a server that is not yet listening', () => {
    expect(server.listening).toBe(false);
  });
});

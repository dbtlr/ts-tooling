import { describe, expect, it } from 'vite-plus/test';

import { viteReactApp } from '../src/vite.js';

describe('viteReactApp()', () => {
  it('returns empty plugins and no resolve by default', () => {
    expect(viteReactApp()).toStrictEqual({
      plugins: [],
      resolve: undefined,
      server: undefined,
      test: undefined,
    });
  });

  it('maps alias into resolve and passes through server and test', () => {
    const config = viteReactApp({
      alias: { '@': '/src' },
      server: { port: 3000 },
      test: { globals: true },
    });

    expect(config.resolve).toStrictEqual({ alias: { '@': '/src' } });
    expect(config.server).toStrictEqual({ port: 3000 });
    expect(config.test).toStrictEqual({ globals: true });
  });
});

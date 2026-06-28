import { describe, expect, it } from 'vite-plus/test';

import { vitestNode, vitestReact, vitestWorkspace } from '../src/vitest.js';

describe('vitest presets', () => {
  it('creates node defaults', () => {
    expect(vitestNode()).toMatchObject({
      test: { environment: 'node' },
    });
  });

  it('creates react jsdom defaults', () => {
    expect(vitestReact()).toMatchObject({
      test: { environment: 'jsdom', globals: true },
    });
  });

  it('creates workspace config', () => {
    expect(vitestWorkspace([vitestNode(), vitestReact()])).toMatchObject({
      test: { projects: expect.any(Array) },
    });
  });
});

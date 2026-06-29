import { describe, expect, it } from 'vite-plus/test';

import { testNode, testProjects, testReact } from '../src/vitest.js';

describe('test helpers (value-form)', () => {
  it('testNode returns a bare node test value', () => {
    expect(testNode()).toMatchObject({ environment: 'node' });
    expect(testNode()).not.toHaveProperty('test');
  });

  it('testReact returns jsdom + globals', () => {
    const value = testReact();
    expect(value).toMatchObject({ environment: 'jsdom', globals: true });
    expect(value).not.toHaveProperty('setupFiles');
  });

  it('a caller-supplied setupFiles passes through', () => {
    const value = testReact({ setupFiles: ['./mine.ts'] });
    expect(value.setupFiles).toStrictEqual(['./mine.ts']);
  });

  it('testProjects wraps bare values into project entries with extends: true', () => {
    expect(testProjects([testNode({ name: 'api' })])).toMatchObject({
      projects: [{ extends: true, test: { name: 'api' } }],
    });
  });

  it('testProjects honors an explicit extends override', () => {
    expect(testProjects([testNode()], { extends: false })).toMatchObject({
      projects: [{ extends: false }],
    });
  });
});

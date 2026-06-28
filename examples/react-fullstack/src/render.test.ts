import { describe, expect, it } from 'vite-plus/test';

import { renderPage } from './render.js';

describe('server-side rendering', () => {
  it('renders the app to HTML', () => {
    expect(renderPage()).toContain('Hello from the isomorphic React example');
  });
});

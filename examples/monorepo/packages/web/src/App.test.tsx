import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { App } from './App.js';

describe('the web app component', () => {
  it('renders the heading', () => {
    expect(renderToStaticMarkup(<App />)).toContain('Hello from the monorepo web package');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { App } from './App.js';

describe('the app component', () => {
  it('renders the heading', () => {
    expect(renderToStaticMarkup(<App />)).toContain('Hello from the React SPA example');
  });
});

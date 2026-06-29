import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { App } from './App.js';

// Live jsdom + jest-dom proof: exercises toolingConfig({ react: true })'s jsdom
// environment, the dom setup file (@dbtlr/tooling/setup/dom), and server.fs.allow
// end-to-end. toBeInTheDocument() only resolves when the setupFile is registered.
describe('jsdom dom-matcher smoke test', () => {
  it('renders the app heading into the DOM', () => {
    render(<App />);
    expect(screen.getByText('Hello from the isomorphic React example')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

const Hello = () => <h1>hello</h1>;

describe('dom setup', () => {
  it('jest-dom matchers are registered via @dbtlr/tooling/setup/dom', () => {
    render(<Hello />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});

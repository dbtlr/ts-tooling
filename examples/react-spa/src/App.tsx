import type { ReactElement } from 'react';

// No `import React` — the modern automatic JSX runtime is enabled and
// `react/react-in-jsx-scope` is disabled by `lint: { react: true }`.
const App = (): ReactElement => <h1>Hello from the React SPA example</h1>;

export { App };

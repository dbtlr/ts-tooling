import type { ReactElement } from 'react';

// No `import React` — the automatic JSX runtime is enabled and
// `react/react-in-jsx-scope` is turned off by the `packages/web/**` override in
// the root config. The PascalCase filename (App.tsx) is likewise allowed only
// because that override widens `unicorn/filename-case` to accept it.
const App = (): ReactElement => <h1>Hello from the monorepo web package</h1>;

export { App };

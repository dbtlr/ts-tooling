import type { ReactElement } from 'react';

// No `import React` — the automatic JSX runtime is enabled and
// `react/react-in-jsx-scope` is turned off by the `packages/web/**` override in
// the root config. The PascalCase filename (App.tsx) is likewise allowed only
// because that override widens `unicorn/filename-case` to accept it.
//
// The inline arrow handler below would trip `react-perf/jsx-no-new-function-as-prop`
// (a `perf` = error rule under the react target). The root config disables it for
// this package via the OBJECT-FORM react target (`react: { files, rules }`),
// proving a consumer can tune a target's own rules — see ../../vite.config.ts.
const App = (): ReactElement => (
  <main>
    <h1>Hello from the monorepo web package</h1>
    <button
      type="button"
      onClick={() => {
        document.title = 'clicked';
      }}
    >
      ok
    </button>
  </main>
);

export { App };

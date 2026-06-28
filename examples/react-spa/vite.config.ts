import { toolingConfig } from '@dbtlr/tooling';

// Browser-only React: `react` enables the React lint plugins, the jsdom test
// env, and the vite react-app block. Add `@vitejs/plugin-react` via the granular
// `viteReactApp({ plugins: [react()] })` helper for a real dev/build server.
export default toolingConfig({ react: true });

import { fileURLToPath } from 'node:url';

// The tooling package root. With a normal (registry) install this lives inside the
// consumer's node_modules — already within Vite's allowed fs roots, so appending it
// is a harmless no-op. With a pnpm `link:`/symlink install the package resolves to a
// path OUTSIDE the project root, which Vite's server.fs.strict blocks when loading
// the setup module; appending the root to server.fs.allow fixes that. Built output
// sits at dist/index.mjs (domSetup is bundled into the index entry), so `..`
// resolves to the package root.
const TOOLING_ROOT = fileURLToPath(new URL('..', import.meta.url));

const DOM_SETUP = '@dbtlr/tooling/setup/dom';

// A small additive plugin: it contributes the jest-dom matchers setup file to the
// test run AND allows Vite to serve that file under a link: install. Both are
// purely additive (Vite concatenates `test.setupFiles` and `server.fs.allow`), so
// no defer-to-user merge is needed here — the consumer's own entries are preserved
// alongside these. Add it to `plugins` when you want DOM matchers in your tests.
const domSetup = () => ({
  config: () => ({
    server: { fs: { allow: [TOOLING_ROOT] } },
    test: { setupFiles: [DOM_SETUP] },
  }),
  name: '@dbtlr/tooling:dom-setup',
});

export { domSetup };

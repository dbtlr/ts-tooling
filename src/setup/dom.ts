// Vitest setup module: register the jest-dom matchers (`toBeInTheDocument`,
// `toHaveTextContent`, …) on vitest's `expect`. Pulled in by the `domSetup()`
// plugin (and `toolingConfig`'s react/DOM contribution), which add it to
// `test.setupFiles`. Test teardown is not handled here — @testing-library/react
// auto-registers its own afterEach cleanup when imported in a vitest run.
// oxlint-disable-next-line import/no-unassigned-import -- side-effect-only setup module
import '@testing-library/jest-dom/vitest';

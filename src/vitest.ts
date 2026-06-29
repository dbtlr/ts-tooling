import { compactObject } from './types.js';
import type { JsonObject } from './types.js';

type VitestProjectOptions = {
  readonly name?: string;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
  readonly setupFiles?: readonly string[];
  readonly globals?: boolean;
  readonly coverage?: JsonObject | false;
};

// testReact also accepts `setup` to drop the bundled DOM setup for exotic setups.
type VitestReactOptions = VitestProjectOptions & { readonly setup?: boolean };

type VitestEnvironment = 'node' | 'jsdom' | 'happy-dom' | 'browser';

type TestProjectsOptions = { readonly extends?: boolean };

const DOM_SETUP = '@dbtlr/tooling/setup/dom';

// Build the bare value for the `test` config key (or a project entry's `test`).
const testValue = (
  environment: VitestEnvironment,
  options: VitestProjectOptions,
  defaultInclude: readonly string[],
  defaultSetupFiles: readonly string[],
): JsonObject => {
  const setupFiles = [...defaultSetupFiles, ...(options.setupFiles ?? [])];
  return compactObject({
    coverage: options.coverage === false ? undefined : options.coverage,
    environment,
    exclude: options.exclude ? [...options.exclude] : undefined,
    globals: options.globals,
    include: [...(options.include ?? defaultInclude)],
    name: options.name,
    setupFiles: setupFiles.length > 0 ? setupFiles : undefined,
  });
};

const testNode = (options: VitestProjectOptions = {}): JsonObject =>
  testValue('node', options, ['src/**/*.test.ts', 'tests/**/*.test.ts'], []);

const testReact = (options: VitestReactOptions = {}): JsonObject => {
  const { setup = true, ...rest } = options;
  return testValue(
    'jsdom',
    { globals: true, ...rest },
    ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    setup ? [DOM_SETUP] : [],
  );
};

// Collect bare test values into a Vitest `projects` array (the monorepo model).
// Each entry inherits the root config by default (`extends: true`) so a react
// project picks up the root @vitejs/plugin-react.
const testProjects = (
  projects: readonly JsonObject[],
  options: TestProjectsOptions = {},
): JsonObject => ({
  projects: projects.map((test) => ({ extends: options.extends ?? true, test })),
});

export { testNode, testProjects, testReact };
export type { TestProjectsOptions, VitestEnvironment, VitestProjectOptions, VitestReactOptions };

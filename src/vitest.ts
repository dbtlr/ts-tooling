import { compactObject } from "./types.js";
import type { JsonObject } from "./types.js";

type VitestProjectOptions = {
  readonly name?: string;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
  readonly setupFiles?: readonly string[];
  readonly globals?: boolean;
  readonly coverage?: JsonObject | false;
};

type VitestEnvironment = "node" | "jsdom" | "happy-dom" | "browser";

const vitestConfig = (
  environment: VitestEnvironment,
  options: VitestProjectOptions,
  defaultInclude: readonly string[],
): JsonObject => ({
  test: compactObject({
    coverage: options.coverage === false ? undefined : options.coverage,
    environment,
    exclude: options.exclude ? [...options.exclude] : undefined,
    globals: options.globals,
    include: [...(options.include ?? defaultInclude)],
    name: options.name,
    setupFiles: options.setupFiles ? [...options.setupFiles] : undefined,
  }),
});

const vitestNode = (options: VitestProjectOptions = {}): JsonObject =>
  vitestConfig("node", options, ["src/**/*.test.ts", "tests/**/*.test.ts"]);

const vitestReact = (options: VitestProjectOptions = {}): JsonObject =>
  vitestConfig("jsdom", { globals: true, ...options }, [
    "src/**/*.test.{ts,tsx}",
    "tests/**/*.test.{ts,tsx}",
  ]);

const vitestWorkspace = (projects: readonly JsonObject[]): JsonObject => ({
  test: { projects: [...projects] },
});

export { vitestNode, vitestReact, vitestWorkspace };
export type { VitestEnvironment, VitestProjectOptions };

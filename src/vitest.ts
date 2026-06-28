import { compactObject } from "./types.js";
import type { JsonObject } from "./types.js";

export type VitestProjectOptions = {
  readonly name?: string;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
  readonly setupFiles?: readonly string[];
  readonly globals?: boolean;
  readonly coverage?: JsonObject | false;
};

export type VitestEnvironment = "node" | "jsdom" | "happy-dom" | "browser";

export function vitestNode(options: VitestProjectOptions = {}): JsonObject {
  return vitestConfig("node", options, ["src/**/*.test.ts", "tests/**/*.test.ts"]);
}

export function vitestReact(options: VitestProjectOptions = {}): JsonObject {
  return vitestConfig("jsdom", { globals: true, ...options }, [
    "src/**/*.test.{ts,tsx}",
    "tests/**/*.test.{ts,tsx}",
  ]);
}

export function vitestWorkspace(projects: readonly JsonObject[]): JsonObject {
  return { test: { projects: [...projects] } };
}

function vitestConfig(
  environment: VitestEnvironment,
  options: VitestProjectOptions,
  defaultInclude: readonly string[],
): JsonObject {
  return {
    test: compactObject({
      coverage: options.coverage === false ? undefined : options.coverage,
      environment,
      exclude: options.exclude ? [...options.exclude] : undefined,
      globals: options.globals,
      include: [...(options.include ?? defaultInclude)],
      name: options.name,
      setupFiles: options.setupFiles ? [...options.setupFiles] : undefined,
    }),
  };
}

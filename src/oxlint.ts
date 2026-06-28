import { compactObject } from "./types.js";
import type { JsonObject } from "./types.js";

export type OxlintTarget = "node" | "bun" | "browser" | "react";
export type OxlintTests = "vitest" | false;

export type OxlintOptions = {
  readonly target?: OxlintTarget;
  readonly tests?: OxlintTests;
  readonly typeAware?: boolean;
  readonly typeCheck?: boolean;
  readonly strictWarnings?: boolean;
  readonly ignores?: readonly string[];
  readonly plugins?: readonly string[];
  readonly rules?: JsonObject;
  readonly overrides?: readonly JsonObject[];
};

const basePlugins = [
  "eslint",
  "typescript",
  "oxc",
  "import",
  "unicorn",
  "promise",
  "node",
] as const;
const reactPlugins = ["react", "jsx-a11y"] as const;
const testPlugins = ["vitest"] as const;

export function oxlintBase(options: OxlintOptions = {}): JsonObject {
  const plugins = [
    ...basePlugins,
    ...(options.target === "react" ? reactPlugins : []),
    ...(options.tests === "vitest" ? testPlugins : []),
    ...(options.plugins ?? []),
  ];

  return compactObject({
    categories: {
      correctness: "error",
      nursery: "off",
      pedantic: "off",
      perf: "error",
      restriction: "off",
      style: "warn",
      suspicious: "error",
    },
    env: compactObject({
      builtin: true,
      node: options.target === "node" || options.target === "bun",
      browser: options.target === "browser" || options.target === "react",
      vitest: options.tests === "vitest",
    }),
    ignorePatterns: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".turbo/**",
      ".vite/**",
      ...(options.ignores ?? []),
    ],
    options: compactObject({
      typeAware: options.typeAware,
      typeCheck: options.typeCheck,
      maxWarnings: options.strictWarnings ? 0 : undefined,
    }),
    overrides: [...oxlintTestOverrides(options), ...(options.overrides ?? [])],
    plugins: [...new Set(plugins)],
    rules: {
      "import/no-named-export": "off",
      "import/no-nodejs-modules": "off",
      "no-duplicate-imports": ["warn", { allowSeparateTypeImports: true }],
      "no-magic-numbers": "off",
      "no-ternary": "off",
      "sort-imports": "off",
      "typescript/consistent-type-definitions": ["warn", "type"],
      "unicorn/no-null": "off",
      ...options.rules,
    },
  });
}

export function oxlint(options: OxlintOptions = {}): JsonObject {
  return oxlintBase(options);
}

export function oxlintReact(options: Omit<OxlintOptions, "target"> = {}): JsonObject {
  return oxlintBase({ ...options, target: "react" });
}

export function oxlintTestOverrides(options: Pick<OxlintOptions, "tests"> = {}): JsonObject[] {
  if (options.tests !== "vitest") {
    return [];
  }

  return [
    {
      files: [
        "tests/**/*.ts",
        "tests/**/*.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
      rules: {
        "max-statements": "off",
        "vitest/no-importing-vitest-globals": "off",
        "vitest/prefer-importing-vitest-globals": "off",
      },
    },
  ];
}

import { compactObject } from "./types.js";
import type { JsonObject } from "./types.js";

type OxlintTarget = "node" | "bun" | "browser" | "react";
type OxlintTests = "vitest" | false;

type OxlintOptions = {
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

const oxlintTestOverrides = (options: Pick<OxlintOptions, "tests"> = {}): JsonObject[] => {
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
        // Conflicts with vitest/prefer-strict-boolean-matchers; prefer strict toBe(true|false).
        "vitest/prefer-to-be-falsy": "off",
        "vitest/prefer-to-be-truthy": "off",
      },
    },
  ];
};

const oxlintBase = (options: OxlintOptions = {}): JsonObject => {
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
      browser: options.target === "browser" || options.target === "react",
      builtin: true,
      node: options.target === "node" || options.target === "bun",
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
      maxWarnings: options.strictWarnings ? 0 : undefined,
      typeAware: options.typeAware,
      typeCheck: options.typeCheck,
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
};

const oxlint = (options: OxlintOptions = {}): JsonObject => oxlintBase(options);

const oxlintReact = (options: Omit<OxlintOptions, "target"> = {}): JsonObject =>
  oxlintBase({ ...options, target: "react" });

export { oxlint, oxlintBase, oxlintReact, oxlintTestOverrides };
export type { OxlintOptions, OxlintTarget, OxlintTests };

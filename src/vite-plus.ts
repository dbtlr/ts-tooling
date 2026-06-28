import { compactObject } from "./types.js";
import type { JsonObject } from "./types.js";

export type VitePlusLintOptions = {
  readonly typeAware?: boolean;
  readonly typeCheck?: boolean;
  readonly denyWarnings?: boolean;
  readonly maxWarnings?: number;
  readonly ignores?: readonly string[];
  readonly rules?: JsonObject;
  readonly overrides?: readonly JsonObject[];
};

export type VitePlusPackageOptions = {
  readonly pack?: JsonObject;
  readonly lint?: VitePlusLintOptions;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

export function vitePlusBase(options: VitePlusPackageOptions = {}): JsonObject {
  return compactObject({
    fmt: {
      ignorePatterns: [
        "pnpm-lock.yaml",
        "bun.lock",
        "dist/**",
        "build/**",
        "node_modules/**",
        "coverage/**",
        ".turbo/**",
        ".vite/**",
      ],
      ...options.fmt,
    },
    lint: vitePlusLint(options.lint),
    staged: options.staged === false ? undefined : (options.staged ?? { "*": "vp check --fix" }),
  });
}

export function vitePlusPackage(options: VitePlusPackageOptions = {}): JsonObject {
  return {
    ...vitePlusBase(options),
    pack: {
      dts: { tsgo: true },
      exports: true,
      ...options.pack,
    },
  };
}

export function vitePlusMonorepo(options: VitePlusPackageOptions = {}): JsonObject {
  return vitePlusBase({
    ...options,
    lint: {
      denyWarnings: true,
      typeAware: true,
      typeCheck: true,
      ...options.lint,
    },
  });
}

function vitePlusLint(options: VitePlusLintOptions = {}): JsonObject {
  return {
    categories: {
      correctness: "error",
      nursery: "off",
      pedantic: "off",
      perf: "error",
      restriction: "off",
      style: "warn",
      suspicious: "error",
    },
    ignorePatterns: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      ".turbo",
      ".vite",
      ...(options.ignores ?? []),
    ],
    options: compactObject({
      typeAware: options.typeAware,
      typeCheck: options.typeCheck,
      denyWarnings: options.denyWarnings,
      maxWarnings: options.maxWarnings,
    }),
    overrides: [
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
      ...(options.overrides ?? []),
    ],
    plugins: ["typescript", "import", "eslint", "unicorn", "oxc", "promise", "node", "vitest"],
    rules: {
      "capitalized-comments": "off",
      "import/no-named-export": "off",
      "import/no-nodejs-modules": "off",
      "no-duplicate-imports": ["warn", { allowSeparateTypeImports: true }],
      "no-magic-numbers": "off",
      "no-ternary": "off",
      "sort-imports": "off",
      "typescript/consistent-type-definitions": ["warn", "type"],
      "unicorn/no-null": "off",
      "vitest/prefer-importing-vitest-globals": "off",
      ...options.rules,
    },
  };
}

import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };

const packageJson = pkg as typeof pkg & { readonly dependencies?: Record<string, string> };

describe("package metadata", () => {
  it("is tree-shakeable and has no runtime dependencies", () => {
    expect(packageJson.sideEffects).toBeFalsy();
    expect(packageJson.dependencies).toBeUndefined();
  });

  it("uses optional peer metadata for tool integrations", () => {
    expect(packageJson.peerDependenciesMeta.oxlint.optional).toBeTruthy();
    expect(packageJson.peerDependenciesMeta.vitest.optional).toBeTruthy();
    expect(packageJson.peerDependenciesMeta.vite.optional).toBeTruthy();
    expect(packageJson.peerDependenciesMeta["vite-plus"].optional).toBeTruthy();
  });

  it("exports subpaths for tree-shakeable consumption", () => {
    expect(Object.keys(packageJson.exports)).toStrictEqual(
      expect.arrayContaining([
        ".",
        "./oxlint",
        "./vitest",
        "./vite-plus",
        "./vite",
        "./tsconfig/node.json",
      ]),
    );
  });
});

import { describe, expect, it } from "vite-plus/test";
import { vitePlusBase, vitePlusMonorepo, vitePlusPackage } from "../src/vite-plus.js";

describe("vite-plus presets", () => {
  it("builds a base config with fmt, lint, and staged blocks", () => {
    expect.hasAssertions();
    const config = vitePlusBase();

    expect(config.fmt).toBeDefined();
    expect(config.lint).toBeDefined();
    expect(config.staged).toStrictEqual({ "*": "vp check --fix" });
  });

  it("adds a pack block for packages", () => {
    expect.hasAssertions();
    const config = vitePlusPackage({ pack: { entry: ["src/index.ts"] } });

    expect(config.pack).toMatchObject({ entry: ["src/index.ts"], exports: true });
  });

  it("disables staged when explicitly set to false", () => {
    expect.hasAssertions();
    expect(vitePlusBase({ staged: false }).staged).toBeUndefined();
  });

  it("includes the vitest test-file overrides in lint", () => {
    expect.hasAssertions();
    expect(vitePlusBase().lint).toMatchObject({
      overrides: [{ rules: { "vitest/no-importing-vitest-globals": "off" } }],
    });
  });

  it("enables type-aware checks and denyWarnings for monorepo", () => {
    expect.hasAssertions();
    expect(vitePlusMonorepo().lint).toMatchObject({
      options: { denyWarnings: true, typeAware: true, typeCheck: true },
    });
  });
});

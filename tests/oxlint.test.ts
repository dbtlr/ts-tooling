import { describe, expect, it } from "vite-plus/test";
import { oxlint, oxlintReact } from "../src/oxlint.js";

describe("oxlint presets", () => {
  it("returns a node/vitest config without runtime tool imports", () => {
    const config = oxlint({ strictWarnings: true, target: "node", tests: "vitest" });

    expect(config.plugins).toContain("typescript");
    expect(config.plugins).toContain("vitest");
    expect(config.options).toStrictEqual({ maxWarnings: 0 });
    expect(config.overrides).toHaveLength(1);
  });

  it("adds react plugins for react targets", () => {
    const config = oxlintReact();

    expect(config.plugins).toContain("react");
    expect(config.plugins).toContain("jsx-a11y");
  });

  it("disables prefer-ternary so ternaries are allowed but not forced", () => {
    expect(oxlint().rules).toMatchObject({
      "no-ternary": "off",
      "unicorn/prefer-ternary": "off",
    });
  });

  it("disables the boolean-matcher rules at base for vitest configs", () => {
    expect(oxlint({ tests: "vitest" }).rules).toMatchObject({
      "vitest/prefer-to-be-falsy": "off",
      "vitest/prefer-to-be-truthy": "off",
    });
  });

  it("omits vitest rules when vitest is not enabled", () => {
    const { rules } = oxlint({ tests: false });

    expect(rules).not.toHaveProperty("vitest/prefer-to-be-falsy");
    expect(rules).not.toHaveProperty("vitest/prefer-to-be-truthy");
  });
});

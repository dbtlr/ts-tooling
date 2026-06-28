import { describe, expect, it } from "vitest";
import { oxlint, oxlintReact } from "../src/oxlint.js";

describe("oxlint presets", () => {
  it("returns a node/vitest config without runtime tool imports", () => {
    expect.hasAssertions();
    const config = oxlint({ strictWarnings: true, target: "node", tests: "vitest" });

    expect(config.plugins).toContain("typescript");
    expect(config.plugins).toContain("vitest");
    expect(config.options).toStrictEqual({ maxWarnings: 0 });
    expect(config.overrides).toHaveLength(1);
  });

  it("adds react plugins for react targets", () => {
    expect.hasAssertions();
    const config = oxlintReact();

    expect(config.plugins).toContain("react");
    expect(config.plugins).toContain("jsx-a11y");
  });
});

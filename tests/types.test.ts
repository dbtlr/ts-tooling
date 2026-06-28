import { describe, expect, it } from "vite-plus/test";
import { compactObject } from "../src/types.js";

describe("compactObject()", () => {
  it("drops only undefined-valued keys", () => {
    expect(compactObject({ kept: 1, omitted: undefined, retained: null })).toStrictEqual({
      kept: 1,
      retained: null,
    });
  });

  it("preserves falsy values that are not undefined", () => {
    expect(compactObject({ empty: "", flag: false, zero: 0 })).toStrictEqual({
      empty: "",
      flag: false,
      zero: 0,
    });
  });
});

import { SizedArray } from "@arcanvas/array";
import { describe, expect, it } from "bun:test";

describe("SizedArray", () => {
  it("constructs from numeric values", () => {
    const v = new SizedArray(3, [1, 2, 3]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(3);
  });

  it("from constructs from array", () => {
    expect(SizedArray.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(SizedArray.from([1]).toArray()).toEqual([1]);
  });

  it("constructs from array", () => {
    const v = SizedArray.from([1, 2, 3]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(3);
  });

  it("converts to array", () => {
    const v = new SizedArray(3, [1, 2, 3]);
    expect(v.toArray()).toEqual([1, 2, 3]);
  });

  it("converts to string", () => {
    const v = new SizedArray(3, [1, 2, 3]);
    expect(v.toString()).toBe("SizedArray(1, 2, 3)");
  });
});

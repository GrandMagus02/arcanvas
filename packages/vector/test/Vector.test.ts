import { Float64Vector2, Vector2 } from "@arcanvas/vector";
import { describe, expect, it } from "bun:test";

describe("Vector", () => {
  it("constructs from numeric values (generic)", () => {
    const v = new Vector2(1, 2);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
  });

  it("from constructs from array (generic)", () => {
    expect(Vector2.from([1, 2]).toArray()).toEqual([1, 2]);
    expect(Vector2.from([1]).toArray()).toEqual([1]);
  });

  it("constructs from array (generic)", () => {
    const v = Vector2.from([1, 2]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
  });

  it("converts to array", () => {
    const v = new Vector2(1, 2);
    expect(v.toArray()).toEqual([1, 2]);
  });

  it("converts to string", () => {
    const v = new Vector2(1, 2);
    expect(v.toString()).toBe("Vector2(1, 2)");
  });

  it("generic vectors compare equal element-wise", () => {
    const v = new Vector2(1, 2);
    expect(v.equals(new Vector2(1, 2))).toBe(true);
  });

  it("scales by scalar (number vector)", () => {
    const v = new Float64Vector2(1, 2);
    expect(v.scale(2)).toEqual(new Float64Vector2(2, 4));
  });

  it("adds another vector (number vector)", () => {
    const v = new Float64Vector2(1, 2);
    expect(v.add(new Float64Vector2(4, 5))).toEqual(new Float64Vector2(5, 7));
  });

  it("subtracts another vector (number vector)", () => {
    const v = new Float64Vector2(1, 2);
    expect(v.sub(new Float64Vector2(4, 5))).toEqual(new Float64Vector2(-3, -3));
  });

  it("dot product with another vector (number vector)", () => {
    const v = new Float64Vector2(1, 2);
    expect(v.dot(new Float64Vector2(4, 5))).toEqual(14);
  });

  it("distance via magnitude of difference (number vector)", () => {
    const v = new Float64Vector2(1, 2);
    const d = v.sub(new Float64Vector2(2, 4)).magnitude();
    expect(d).toEqual(Math.sqrt(5));
  });

  it("normalize (number vector)", () => {
    const v = new Float64Vector2(1, 2);
    expect(v.normalized()).toEqual(new Float64Vector2(1 / Math.sqrt(5), 2 / Math.sqrt(5)));
  });
});

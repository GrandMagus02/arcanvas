import { describe, expect, it } from "bun:test";
import { Vector2 } from "../src/Vector";

describe("Vector2", () => {
  it("constructs from numeric values", () => {
    const v = new Vector2([1, 2]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
  });

  it("ignores extra arguments", () => {
    const v = new Vector2([1, 2, 3, 4]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBeUndefined();
    expect(v.length).toBe(2);
  });

  it("throws if too few values", () => {
    expect(() => new Vector2([1])).toThrow();
  });

  it("from enforces size", () => {
    expect(Vector2.from([1, 2]).toArray()).toEqual([1, 2]);
    expect(() => Vector2.from([1])).toThrow();
  });

  it("constructs from array", () => {
    const v = Vector2.from([1, 2]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
  });

  it("converts to array", () => {
    const v = new Vector2([1, 2]);
    expect(v.toArray()).toEqual([1, 2]);
  });

  it("converts to string", () => {
    const v = new Vector2([1, 2]);
    expect(v.toString()).toBe("Vector2(1, 2)");
  });

  it("converts to equals", () => {
    const v = new Vector2([1, 2]);
    expect(v.equals(new Vector2([1, 2]))).toBe(true);
  });

  it("multiplies by scalar", () => {
    const v = new Vector2([1, 2]);
    expect(v.multiply(2)).toEqual(new Vector2([2, 4]));
  });

  it("adds another vector", () => {
    const v = new Vector2([1, 2]);
    expect(v.add(new Vector2([4, 5]))).toEqual(new Vector2([5, 7]));
  });

  it("subtracts another vector", () => {
    const v = new Vector2([1, 2]);
    expect(v.subtract(new Vector2([4, 5]))).toEqual(new Vector2([-3, -3]));
  });

  it("dot product with another vector", () => {
    const v = new Vector2([1, 2]);
    expect(v.dot(new Vector2([4, 5]))).toEqual(14);
  });

  it("distance", () => {
    const v = new Vector2([1, 2]);
    expect(v.distance(new Vector2([2, 4]))).toEqual(Math.sqrt(5));
  });

  it("normalize", () => {
    const v = new Vector2([1, 2]);
    expect(v.normalize()).toEqual(new Vector2([1 / Math.sqrt(5), 2 / Math.sqrt(5)]));
  });
});

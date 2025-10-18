import { describe, expect, it } from "bun:test";
import { Vector } from "../src/Vector";

describe("Vector", () => {
  it("constructs from numeric values", () => {
    const v = new Vector([1, 2, 3]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(3);
  });

  it("constructs from array", () => {
    const v = Vector.from([1, 2, 3]);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(3);
  });

  it("converts to array", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.toArray()).toEqual([1, 2, 3]);
  });

  it("converts to string", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.toString()).toBe("Vector(1, 2, 3)");
  });

  it("converts to equals", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.equals(new Vector([1, 2, 3]))).toBe(true);
  });

  it("multiplies by scalar", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.multiply(2)).toEqual(new Vector([2, 4, 6]));
  });

  it("adds another vector", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.add(new Vector([4, 5, 6]))).toEqual(new Vector([5, 7, 9]));
  });

  it("subtracts another vector", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.subtract(new Vector([4, 5, 6]))).toEqual(new Vector([-3, -3, -3]));
  });

  it("dot product with another vector", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.dot(new Vector([4, 5, 6]))).toEqual(32);
  });

  it("distance", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.distance(new Vector([0, 0, 0]))).toEqual(Math.sqrt(14));
  });

  it("normalize", () => {
    const v = new Vector([1, 2, 3]);
    expect(v.normalize()).toEqual(
      new Vector([1 / Math.sqrt(14), 2 / Math.sqrt(14), 3 / Math.sqrt(14)])
    );
  });
});

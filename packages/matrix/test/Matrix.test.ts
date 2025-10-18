import { describe, expect, it } from "bun:test";
import { Matrix } from "../src/Matrix";

describe("Matrix (dynamic)", () => {
  it("constructs from array", () => {
    const m = new Matrix([1, 2, 3]);
    expect(m.toArray()).toEqual([1, 2, 3]);
  });

  it("constructs from from()", () => {
    const m = Matrix.from([1, 2, 3]);
    expect(m.toArray()).toEqual([1, 2, 3]);
  });

  it("to2DArray defaults to single row when shape unspecified", () => {
    const m = new Matrix([1, 2, 3]);
    expect(m.to2DArray()).toEqual([[1, 2, 3]]);
  });

  it("equals compares element-wise", () => {
    const a = new Matrix([1, 2, 3]);
    const b = new Matrix([1, 2, 3]);
    const c = new Matrix([1, 2, 4]);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("adds, subtracts, multiplyScalar", () => {
    const a = new Matrix([1, 2, 3]);
    const b = new Matrix([4, 5, 6]);
    expect(a.add(b)).toEqual(new Matrix([5, 7, 9]));
    expect(a.subtract(b)).toEqual(new Matrix([-3, -3, -3]));
    expect(a.multiplyScalar(2)).toEqual(new Matrix([2, 4, 6]));
  });
});

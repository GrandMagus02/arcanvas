import { describe, expect, it } from "bun:test";
import { Matrix2x2 } from "../src/Matrix";

describe("Matrix2x2", () => {
  it("constructs from numeric values", () => {
    const m = new Matrix2x2([1, 2, 3, 4]);
    expect(m.toArray()).toEqual([1, 2, 3, 4]);
    expect(m.to2DArray()).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("ignores extra arguments (slices)", () => {
    const m = new Matrix2x2([1, 2, 3, 4, 5, 6]);
    expect(m.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("throws if too few values", () => {
    expect(() => new Matrix2x2([1, 2, 3])).toThrow();
  });

  it("from enforces size", () => {
    expect(Matrix2x2.from([1, 2, 3, 4]).toArray()).toEqual([1, 2, 3, 4]);
    expect(() => Matrix2x2.from([1, 2, 3])).toThrow();
  });

  it("get/set and at() work with row-major indexing", () => {
    const m = new Matrix2x2([1, 2, 3, 4]);
    expect(m.at(0, 0)).toBe(1);
    expect(m.at(0, 1)).toBe(2);
    expect(m.at(1, 0)).toBe(3);
    expect(m.at(1, 1)).toBe(4);
    m.set(0, 1, 9);
    expect(m.at(0, 1)).toBe(9);
  });

  it("add/subtract/multiplyScalar", () => {
    const a = new Matrix2x2([1, 2, 3, 4]);
    const b = new Matrix2x2([4, 5, 6, 7]);
    expect(a.add(b)).toEqual(new Matrix2x2([5, 7, 9, 11]));
    expect(a.subtract(b)).toEqual(new Matrix2x2([-3, -3, -3, -3]));
    expect(a.multiplyScalar(2)).toEqual(new Matrix2x2([2, 4, 6, 8]));
  });

  it("matrix multiply (2x2 * 2x2)", () => {
    const a = new Matrix2x2([1, 2, 3, 4]); // [ [1,2],[3,4] ]
    const b = new Matrix2x2([5, 6, 7, 8]); // [ [5,6],[7,8] ]
    // result = a*b = [ [1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8] ]
    expect(a.multiplyMatrix(b)).toEqual(new Matrix2x2([19, 22, 43, 50]));
  });

  it("transpose", () => {
    const a = new Matrix2x2([1, 2, 3, 4]);
    expect(a.transpose()).toEqual(new Matrix2x2([1, 3, 2, 4]));
  });
});

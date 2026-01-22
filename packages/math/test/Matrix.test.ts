import { Matrix, Matrix2, Matrix3, Matrix4, Vector2, Vector4 } from "@arcanvas/math";
import { describe, expect, it } from "bun:test";

describe("Matrix2", () => {
  it("initializes properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("initializes properly from array", () => {
    const m = Matrix2.fromArray([1, 2, 3, 4]);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("initializes properly from vector", () => {
    // Matrix2.fromVector creates a 2x1 matrix, which is not a Matrix2 (2x2)
    // So we use Matrix2.fromVector for column vectors
    const m = Matrix2.fromVector(Vector4.of(1, 2, 3, 4));
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("initializes properly from matrix", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.fromMatrix(m);
    expect(n.rows).toBe(2);
    expect(n.columns).toBe(2);
    expect(n.size).toBe(4);
    expect(n.get(0, 0)).toBe(1);
    expect(n.get(0, 1)).toBe(2);
    expect(n.get(1, 0)).toBe(3);
    expect(n.get(1, 1)).toBe(4);
    expect(n.data).not.toBe(m.data);
  });

  it("checks if value is a matrix", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(Matrix.isMatrix(m)).toBe(true);
    expect(Matrix.isMatrix(new Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Float32Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Int32Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Uint32Array(4))).toBe(false);
  });

  it("checks if value is a matrix", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(Matrix.isMatrix(m)).toBe(true);
    expect(Matrix.isMatrix(new Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Float32Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Int32Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Uint32Array(4))).toBe(false);
  });

  it("calculates addition properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.of(5, 6, 7, 8);
    // [1, 2]   [5]   [1 + 5, 2 + 6]
    // [3, 4] + [6] = [3 + 7, 4 + 8]
    const result = m.add(n);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBe(6);
    expect(result.get(0, 1)).toBe(8);
    expect(result.get(1, 0)).toBe(10);
    expect(result.get(1, 1)).toBe(12);
  });

  it("calculates dot product properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.of(5, 6, 7, 8);
    // [1, 2]   [5, 6]
    // [3, 4] * [7, 8] = 1 * 5 + 2 * 6 + 3 * 7 + 4 * 8
    const result = m.dot(n);
    expect(result).toBe(1 * 5 + 2 * 6 + 3 * 7 + 4 * 8);
  });

  it("calculates division properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.of(5, 6, 7, 8);
    // [1, 2]   [5]   [1 / 5, 2 / 6]
    // [3, 4] / [6] = [3 / 7, 4 / 8]
    const result = m.div(n);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBeCloseTo(1 / 5);
    expect(result.get(0, 1)).toBeCloseTo(2 / 6);
    expect(result.get(1, 0)).toBeCloseTo(3 / 7);
    expect(result.get(1, 1)).toBeCloseTo(4 / 8);
  });

  it("calculates subtraction properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.of(5, 6, 7, 8);
    // [1, 2]   [5]   [1 - 5, 2 - 6]
    // [3, 4] - [6] = [3 - 7, 4 - 8]
    const result = m.sub(n);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBe(1 - 5);
    expect(result.get(0, 1)).toBe(2 - 6);
  });

  it("calculates multiplication by vector properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Vector2.of(5, 6);
    // [1, 3]   [5]   [1 * 5 + 3 * 6]
    // [2, 4] * [6] = [2 * 5 + 4 * 6]
    const result = m.mult(n);
    expect(result.size).toBe(2);
    expect(result.get(0)).toBe(1 * 5 + 3 * 6);
    expect(result.get(1)).toBe(2 * 5 + 4 * 6);
  });

  it("checks equality properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.of(1, 2, 3, 4);
    expect(m.equals(n)).toBe(true);
    const o = Matrix2.of(1, 2, 3, 5);
    expect(m.equals(o)).toBe(false);
  });

  it("clones properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = m.clone();
    expect(n.rows).toBe(2);
    expect(n.columns).toBe(2);
    expect(n.get(0, 0)).toBe(1);
    expect(n.get(0, 1)).toBe(2);
    expect(n.get(1, 0)).toBe(3);
    expect(n.get(1, 1)).toBe(4);
    expect(n.data).not.toBe(m.data);
  });

  it("converts to array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toArray();
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("converts to float32 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toFloat32Array();
    expect(result).toEqual(new Float32Array([1, 2, 3, 4]));
  });

  it("converts to float64 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toFloat64Array();
    expect(result).toEqual(new Float64Array([1, 2, 3, 4]));
  });

  it("converts to int8 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toInt8Array();
    expect(result).toEqual(new Int8Array([1, 2, 3, 4]));
  });

  it("converts to int16 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toInt16Array();
    expect(result).toEqual(new Int16Array([1, 2, 3, 4]));
  });

  it("converts to int32 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toInt32Array();
    expect(result).toEqual(new Int32Array([1, 2, 3, 4]));
  });

  it("converts to uint16 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toUint16Array();
    expect(result).toEqual(new Uint16Array([1, 2, 3, 4]));
  });

  it("converts to uint8 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toUint8Array();
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("converts to uint8 clamped array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toUint8ClampedArray();
    expect(result).toEqual(new Uint8ClampedArray([1, 2, 3, 4]));
  });

  it("converts to uint32 array properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.toUint32Array();
    expect(result).toEqual(new Uint32Array([1, 2, 3, 4]));
  });

  it("throws an error if matrix dimensions do not match", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix3.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(() => m.mult(n)).toThrow();
  });

  it("throws an error if matrix index is out of bounds", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(() => m.get(2, 0)).toThrow();
    expect(() => m.get(0, 2)).toThrow();
    expect(() => m.set(2, 0, 1)).toThrow();
    expect(() => m.set(0, 2, 1)).toThrow();
  });

  it("fills with 0 if data contains NaN, infinity, or undefined", () => {
    const m = Matrix2.fromArray([NaN, Infinity, 0, 0]);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(0, 1)).toBe(0);
    expect(m.get(1, 0)).toBe(0);
    expect(m.get(1, 1)).toBe(0);
  });

  it("sets 0 if value is NaN, infinity, or undefined", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    m.set(0, 0, NaN);
    expect(m.get(0, 0)).toBe(0);
    m.set(0, 0, Infinity);
    expect(m.get(0, 0)).toBe(0);
  });

  it("iterates with forEach properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const visited: Array<[number, number, number]> = [];
    m.forEach((value, r, c) => {
      visited.push([value, r, c]);
    });
    expect(visited).toEqual([
      [1, 0, 0],
      [2, 0, 1],
      [3, 1, 0],
      [4, 1, 1],
    ]);
  });

  it("maps matrix properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.map((value) => value * 2);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBe(2);
    expect(result.get(0, 1)).toBe(4);
    expect(result.get(1, 0)).toBe(6);
    expect(result.get(1, 1)).toBe(8);
    // Original matrix should be unchanged
    expect(m.get(0, 0)).toBe(1);
  });

  it("maps matrix with row and column indices properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.map((value, r, c) => r * 10 + c);
    expect(result.get(0, 0)).toBe(0);
    expect(result.get(0, 1)).toBe(1);
    expect(result.get(1, 0)).toBe(10);
    expect(result.get(1, 1)).toBe(11);
  });

  it("reduces matrix properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const sum = m.reduce((acc, value) => acc + value, 0);
    expect(sum).toBe(10);
  });

  it("reduces matrix with initial value properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const product = m.reduce((acc, value) => acc * value, 1);
    expect(product).toBe(24);
  });

  it("reduces matrix with row and column indices properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const sum = m.reduce((acc, value, r, c) => acc + value + r + c, 0);
    // 1+0+0 + 2+0+1 + 3+1+0 + 4+1+1 = 1 + 3 + 4 + 6 = 14
    expect(sum).toBe(14);
  });

  it("checks every element properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.every((value) => value > 0)).toBe(true);
    expect(m.every((value) => value > 2)).toBe(false);
    expect(m.every((value) => value < 10)).toBe(true);
  });

  it("checks every element with row and column indices properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.every((value, r, c) => r < 2 && c < 2)).toBe(true);
    expect(m.every((value, r) => r === 0)).toBe(false);
  });

  it("checks some element properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.some((value) => value === 2)).toBe(true);
    expect(m.some((value) => value === 5)).toBe(false);
    expect(m.some((value) => value > 3)).toBe(true);
  });

  it("checks some element with row and column indices properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.some((value, r, c) => r === 1 && c === 1)).toBe(true);
    expect(m.some((value, r) => r === 2)).toBe(false);
  });

  it("finds first matching element properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.find((value) => value > 2)).toBe(3);
    expect(m.find((value) => value > 10)).toBeUndefined();
    expect(m.find((value) => value === 2)).toBe(2);
  });

  it("finds first matching element with row and column indices properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.find((value, r, c) => r === 1 && c === 0)).toBe(3);
    expect(m.find((value, r) => r === 2)).toBeUndefined();
  });

  it("finds index of first matching element properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.findIndex((value) => value > 2)).toEqual([1, 0]);
    expect(m.findIndex((value) => value > 10)).toBeUndefined();
    expect(m.findIndex((value) => value === 2)).toEqual([0, 1]);
  });

  it("finds index of first matching element with row and column indices properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.findIndex((value, r, c) => r === 1 && c === 1)).toEqual([1, 1]);
    expect(m.findIndex((value, r) => r === 2)).toBeUndefined();
  });

  it("fills empty matrix properly", () => {
    const m = Matrix2.fromArray([]);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(0, 1)).toBe(0);
    expect(m.get(1, 0)).toBe(0);
    expect(m.get(1, 1)).toBe(0);
  });

  it("fills matrix properly", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.fill(5);
    expect(result).toBe(m); // Should return same instance
    expect(m.get(0, 0)).toBe(5);
    expect(m.get(0, 1)).toBe(5);
    expect(m.get(1, 0)).toBe(5);
    expect(m.get(1, 1)).toBe(5);
  });

  it("tests in-place addSelf", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const n = Matrix2.of(1, 1, 1, 1);
    const result = m.addSelf(n);
    expect(result).toBe(m); // Should return same instance
    expect(m.get(0, 0)).toBe(2);
    expect(m.get(0, 1)).toBe(3);
    expect(m.get(1, 0)).toBe(4);
    expect(m.get(1, 1)).toBe(5);
  });

  it("tests in-place subSelf", () => {
    const m = Matrix2.of(5, 6, 7, 8);
    const n = Matrix2.of(1, 1, 1, 1);
    const result = m.subSelf(n);
    expect(result).toBe(m); // Should return same instance
    expect(m.get(0, 0)).toBe(4);
    expect(m.get(0, 1)).toBe(5);
    expect(m.get(1, 0)).toBe(6);
    expect(m.get(1, 1)).toBe(7);
  });

  it("tests in-place scaleSelf", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    const result = m.scaleSelf(2);
    expect(result).toBe(m); // Should return same instance
    expect(m.get(0, 0)).toBe(2);
    expect(m.get(0, 1)).toBe(4);
    expect(m.get(1, 0)).toBe(6);
    expect(m.get(1, 1)).toBe(8);
  });
});

describe("Matrix2 specific", () => {
  it("creates identity matrix", () => {
    const m = Matrix2.identity();
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(0);
    expect(m.get(1, 0)).toBe(0);
    expect(m.get(1, 1)).toBe(1);
  });

  it("creates from fromValues()", () => {
    const m = Matrix2.of(1, 2, 3, 4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("clones with correct type", () => {
    const m = Matrix2.identity();
    const cloned = m.clone();
    expect(cloned).toBeInstanceOf(Matrix2);
    expect(cloned.get(0, 0)).toBe(1);
  });
});

describe("Matrix3", () => {
  it("initializes properly", () => {
    const m = Matrix3.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(m.rows).toBe(3);
    expect(m.columns).toBe(3);
    expect(m.size).toBe(9);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(1, 0)).toBe(4);
    expect(m.get(1, 1)).toBe(5);
    expect(m.get(1, 2)).toBe(6);
    expect(m.get(2, 0)).toBe(7);
    expect(m.get(2, 1)).toBe(8);
    expect(m.get(2, 2)).toBe(9);
  });

  it("initializes properly from array", () => {
    const m = Matrix3.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(m.rows).toBe(3);
    expect(m.columns).toBe(3);
    expect(m.size).toBe(9);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(1, 0)).toBe(4);
    expect(m.get(1, 1)).toBe(5);
    expect(m.get(1, 2)).toBe(6);
    expect(m.get(2, 0)).toBe(7);
    expect(m.get(2, 1)).toBe(8);
    expect(m.get(2, 2)).toBe(9);
  });

  it("calculates transpose properly", () => {
    const m = Matrix3.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    // [1, 2, 3]    [1, 4, 7]
    // [4, 5, 6] -> [2, 5, 8]
    // [7, 8, 9]    [3, 6, 9]
    const result = m.transpose();
    expect(result.rows).toBe(3);
    expect(result.columns).toBe(3);
    expect(result.get(0, 0)).toBe(1);
    expect(result.get(0, 1)).toBe(4);
    expect(result.get(0, 2)).toBe(7);
    expect(result.get(1, 0)).toBe(2);
    expect(result.get(1, 1)).toBe(5);
    expect(result.get(1, 2)).toBe(8);
    expect(result.get(2, 0)).toBe(3);
    expect(result.get(2, 1)).toBe(6);
    expect(result.get(2, 2)).toBe(9);
  });

  it("calculates multiplication properly", () => {
    const m = Matrix3.fromValues(1, 0, 1, 2, 1, 1, 0, 1, 1);
    const n = Matrix3.fromValues(1, 2, 1, 2, 3, 1, 4, 2, 2);
    // [1, 0, 1]   [1, 2, 1]   [5, 4, 3]
    // [2, 1, 1] * [2, 3, 1] = [8, 9, 5]
    // [0, 1, 1]   [4, 2, 2]   [6, 5, 3]
    const result = m.mult(n);
    expect(result.rows).toBe(3);
    expect(result.columns).toBe(3);
    expect(result.get(0, 0)).toBe(5);
    expect(result.get(0, 1)).toBe(4);
    expect(result.get(0, 2)).toBe(3);
    expect(result.get(1, 0)).toBe(8);
    expect(result.get(1, 1)).toBe(9);
    expect(result.get(1, 2)).toBe(5);
    expect(result.get(2, 0)).toBe(6);
    expect(result.get(2, 1)).toBe(5);
    expect(result.get(2, 2)).toBe(3);
  });

  it("creates identity matrix", () => {
    const m = Matrix3.identity();
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(1, 1)).toBe(1);
    expect(m.get(2, 2)).toBe(1);
    expect(m.get(0, 1)).toBe(0);
  });

  it("creates from fromValues()", () => {
    const m = Matrix3.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(1, 0)).toBe(4);
    expect(m.get(1, 1)).toBe(5);
    expect(m.get(1, 2)).toBe(6);
    expect(m.get(2, 0)).toBe(7);
    expect(m.get(2, 1)).toBe(8);
    expect(m.get(2, 2)).toBe(9);
  });

  it("clones with correct type", () => {
    const m = Matrix3.identity();
    const cloned = m.clone();
    expect(cloned).toBeInstanceOf(Matrix3);
    expect(cloned.get(0, 0)).toBe(1);
  });
});

describe("Matrix4", () => {
  it("initializes properly", () => {
    const m = Matrix4.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    expect(m.rows).toBe(4);
    expect(m.columns).toBe(4);
    expect(m.size).toBe(16);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(0, 3)).toBe(4);
    expect(m.get(3, 3)).toBe(16);
  });

  it("initializes properly from array", () => {
    const m = Matrix4.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(m.rows).toBe(4);
    expect(m.columns).toBe(4);
    expect(m.size).toBe(16);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(3, 3)).toBe(16);
  });

  it("initializes properly from matrix with undefined values", () => {
    const m = Matrix4.fromArray([1, 2, 3, 4]);
    expect(m.rows).toBe(4);
    expect(m.columns).toBe(4);
    expect(m.size).toBe(16);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(0, 3)).toBe(4);
    expect(m.get(1, 0)).toBe(0);
    expect(m.get(1, 1)).toBe(0);
    expect(m.get(1, 2)).toBe(0);
    expect(m.get(1, 3)).toBe(0);
  });

  it("creates identity matrix", () => {
    const m = Matrix4.identity();
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(1, 1)).toBe(1);
    expect(m.get(2, 2)).toBe(1);
    expect(m.get(3, 3)).toBe(1);
    expect(m.get(0, 1)).toBe(0);
  });

  it("creates from fromValues()", () => {
    const m = Matrix4.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(0, 3)).toBe(4);
    expect(m.get(3, 3)).toBe(16);
  });

  it("clones with correct type", () => {
    const m = Matrix4.identity();
    const cloned = m.clone();
    expect(cloned).toBeInstanceOf(Matrix4);
    expect(cloned.get(0, 0)).toBe(1);
  });
});

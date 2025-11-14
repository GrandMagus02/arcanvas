import { Matrix } from "@arcanvas/matrix";
import { Vector } from "@arcanvas/vector";
import { describe, expect, it } from "bun:test";

describe("Matrix", () => {
  it("initializes properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("initializes properly with implicit columns", () => {
    const m = new Matrix([1, 2, 3, 4], 2);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("initializes properly from array", () => {
    const m = Matrix.fromArray([1, 2, 3, 4], 2, 2);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it("initializes properly from vector", () => {
    const m = Matrix.fromVector(new Vector([1, 2, 3, 4], 4));
    expect(m.rows).toBe(4);
    expect(m.columns).toBe(1);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(1, 0)).toBe(2);
    expect(m.get(2, 0)).toBe(3);
    expect(m.get(3, 0)).toBe(4);
  });

  it("initializes properly from matrix", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = Matrix.fromMatrix(m);
    expect(n.rows).toBe(2);
    expect(n.columns).toBe(2);
    expect(n.size).toBe(4);
    expect(n.get(0, 0)).toBe(1);
    expect(n.get(0, 1)).toBe(2);
    expect(n.get(1, 0)).toBe(3);
    expect(n.get(1, 1)).toBe(4);
    expect(n.data).not.toBe(m.data);
  });

  it("initializes properly from matrix with undefined values", () => {
    const m = new Matrix([1, 2, 3, 4], 3, 3);
    expect(m.rows).toBe(3);
    expect(m.columns).toBe(3);
    expect(m.size).toBe(9);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(0, 2)).toBe(3);
    expect(m.get(1, 0)).toBe(4);
    expect(m.get(1, 1)).toBe(0);
    expect(m.get(1, 2)).toBe(0);
    expect(m.get(2, 0)).toBe(0);
    expect(m.get(2, 1)).toBe(0);
    expect(m.get(2, 2)).toBe(0);
  });

  it("checks if value is a matrix", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(Matrix.isMatrix(m)).toBe(true);
    expect(Matrix.isMatrix(new Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Float32Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Int32Array(4))).toBe(false);
    expect(Matrix.isMatrix(new Uint32Array(4))).toBe(false);
  });

  it("calculates multiplication properly", () => {
    const m = new Matrix(new Float32Array([1, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 2]), 4, 3);
    const n = new Matrix(new Float32Array([1, 2, 1, 2, 3, 1, 4, 2, 2]), 3, 3);
    // [1, 0, 1]   [1, 2, 1]   [5, 4, 3]
    // [2, 1, 1] * [2, 3, 1] = [8, 9, 5]
    // [1, 1, 1]   [2, 1, 2]   [6, 5, 3]
    const result = m.mult(n);
    expect(result.rows).toBe(4);
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
    expect(result.get(3, 0)).toBe(11);
    expect(result.get(3, 1)).toBe(9);
    expect(result.get(3, 2)).toBe(6);
  });

  it("calculates addition properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Matrix([5, 6, 7, 8], 2, 2);
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
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Matrix([5, 6, 7, 8], 2, 2);
    // [1, 2]   [5, 6]
    // [3, 4] * [7, 8] = 1 * 5 + 2 * 6 + 3 * 7 + 4 * 8
    const result = m.dot(n);
    expect(result).toBe(1 * 5 + 2 * 6 + 3 * 7 + 4 * 8);
  });

  it("calculates transpose properly", () => {
    const m = new Matrix([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 3);
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

  it("calculates division properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Matrix([5, 6, 7, 8], 2, 2);
    // [1, 2]   [5]   [1 / 5, 2 / 6]
    // [3, 4] / [6] = [3 / 7, 4 / 8]
    const result = m.div(n);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBe(1 / 5);
    expect(result.get(0, 1)).toBe(2 / 6);
    expect(result.get(1, 0)).toBe(3 / 7);
    expect(result.get(1, 1)).toBe(4 / 8);
  });

  it("calculates subtraction properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Matrix([5, 6, 7, 8], 2, 2);
    // [1, 2]   [5]   [1 - 5, 2 - 6]
    // [3, 4] - [6] = [3 - 7, 4 - 8]
    const result = m.sub(n);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBe(1 - 5);
    expect(result.get(0, 1)).toBe(2 - 6);
  });

  it("calculates multiplication by vector properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Vector([5, 6], 2);
    // [1, 2]   [5]   [1 * 5 + 2 * 6, 1 * 6 + 2 * 7]
    // [3, 4] * [6] = [3 * 5 + 4 * 6, 3 * 6 + 4 * 7]
    const result = m.mult(n);
    expect(result.rows).toBe(2);
    expect(result.columns).toBe(2);
    expect(result.get(0, 0)).toBe(1 * 5 + 2 * 6);
    expect(result.get(1, 0)).toBe(3 * 5 + 4 * 6);
  });

  it("checks equality properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.equals(n)).toBe(true);
    const o = new Matrix([1, 2, 3, 5], 2, 2);
    expect(m.equals(o)).toBe(false);
  });

  it("clones properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
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
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toArray();
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("converts to float32 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toFloat32Array();
    expect(result).toEqual(new Float32Array([1, 2, 3, 4]));
  });

  it("converts to float64 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toFloat64Array();
    expect(result).toEqual(new Float64Array([1, 2, 3, 4]));
  });

  it("converts to int8 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toInt8Array();
    expect(result).toEqual(new Int8Array([1, 2, 3, 4]));
  });

  it("converts to int16 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toInt16Array();
    expect(result).toEqual(new Int16Array([1, 2, 3, 4]));
  });

  it("converts to int32 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toInt32Array();
    expect(result).toEqual(new Int32Array([1, 2, 3, 4]));
  });

  it("converts to uint16 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toUint16Array();
    expect(result).toEqual(new Uint16Array([1, 2, 3, 4]));
  });

  it("converts to uint8 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toUint8Array();
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("converts to uint8 clamped array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toUint8ClampedArray();
    expect(result).toEqual(new Uint8ClampedArray([1, 2, 3, 4]));
  });

  it("converts to uint32 array properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.toUint32Array();
    expect(result).toEqual(new Uint32Array([1, 2, 3, 4]));
  });

  it("throws an error if matrix dimensions do not match", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const n = new Matrix([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 3);
    expect(() => m.mult(n)).toThrow();
  });

  it("throws an error if matrix dimensions are not positive", () => {
    expect(() => new Matrix([1, 2, 3, 4], 0, 2)).toThrow();
    expect(() => new Matrix([1, 2, 3, 4], 2, 0)).toThrow();
    expect(() => new Matrix([1, 2, 3, 4], 0, 0)).toThrow();
  });

  it("throws an error if matrix index is out of bounds", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(() => m.get(2, 0)).toThrow();
    expect(() => m.get(0, 2)).toThrow();
    expect(() => m.set(2, 0, 1)).toThrow();
    expect(() => m.set(0, 2, 1)).toThrow();
  });

  it("fills with 0 if data contains NaN, infinity, or undefined", () => {
    const m = new Matrix([NaN, Infinity], 2, 2);
    expect(m.rows).toBe(2);
    expect(m.columns).toBe(2);
    expect(m.size).toBe(4);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(0, 1)).toBe(0);
    expect(m.get(1, 0)).toBe(0);
    expect(m.get(1, 1)).toBe(0);
  });

  it("sets 0 if value is NaN, infinity, or undefined", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    m.set(0, 0, NaN);
    expect(m.get(0, 0)).toBe(0);
    m.set(0, 0, Infinity);
    expect(m.get(0, 0)).toBe(0);
  });

  it("iterates with forEach properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
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
    const m = new Matrix([1, 2, 3, 4], 2, 2);
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
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.map((value, r, c) => r * 10 + c);
    expect(result.get(0, 0)).toBe(0);
    expect(result.get(0, 1)).toBe(1);
    expect(result.get(1, 0)).toBe(10);
    expect(result.get(1, 1)).toBe(11);
  });

  it("reduces matrix properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const sum = m.reduce((acc, value) => acc + value, 0);
    expect(sum).toBe(10);
  });

  it("reduces matrix with initial value properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const product = m.reduce((acc, value) => acc * value, 1);
    expect(product).toBe(24);
  });

  it("reduces matrix with row and column indices properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const sum = m.reduce((acc, value, r, c) => acc + value + r + c, 0);
    // 1+0+0 + 2+0+1 + 3+1+0 + 4+1+1 = 1 + 3 + 4 + 6 = 14
    expect(sum).toBe(14);
  });

  it("checks every element properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.every((value) => value > 0)).toBe(true);
    expect(m.every((value) => value > 2)).toBe(false);
    expect(m.every((value) => value < 10)).toBe(true);
  });

  it("checks every element with row and column indices properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.every((value, r, c) => r < 2 && c < 2)).toBe(true);
    expect(m.every((value, r) => r === 0)).toBe(false);
  });

  it("checks some element properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.some((value) => value === 2)).toBe(true);
    expect(m.some((value) => value === 5)).toBe(false);
    expect(m.some((value) => value > 3)).toBe(true);
  });

  it("checks some element with row and column indices properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.some((value, r, c) => r === 1 && c === 1)).toBe(true);
    expect(m.some((value, r) => r === 2)).toBe(false);
  });

  it("finds first matching element properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.find((value) => value > 2)).toBe(3);
    expect(m.find((value) => value > 10)).toBeUndefined();
    expect(m.find((value) => value === 2)).toBe(2);
  });

  it("finds first matching element with row and column indices properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.find((value, r, c) => r === 1 && c === 0)).toBe(3);
    expect(m.find((value, r) => r === 2)).toBeUndefined();
  });

  it("finds index of first matching element properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.findIndex((value) => value > 2)).toEqual([1, 0]);
    expect(m.findIndex((value) => value > 10)).toBeUndefined();
    expect(m.findIndex((value) => value === 2)).toEqual([0, 1]);
  });

  it("finds index of first matching element with row and column indices properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    expect(m.findIndex((value, r, c) => r === 1 && c === 1)).toEqual([1, 1]);
    expect(m.findIndex((value, r) => r === 2)).toBeUndefined();
  });

  it("fills empty matrix properly", () => {
    const m = new Matrix([], 2, 2);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(0, 1)).toBe(0);
    expect(m.get(1, 0)).toBe(0);
    expect(m.get(1, 1)).toBe(0);
  });

  it("fills matrix properly", () => {
    const m = new Matrix([1, 2, 3, 4], 2, 2);
    const result = m.fill(5);
    expect(result).toBe(m); // Should return same instance
    expect(m.get(0, 0)).toBe(5);
    expect(m.get(0, 1)).toBe(5);
    expect(m.get(1, 0)).toBe(5);
    expect(m.get(1, 1)).toBe(5);
  });
});

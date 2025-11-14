import { Vector } from "@arcanvas/vector";
import { describe, expect, it } from "bun:test";

describe("Vector", () => {
  it("initializes properly", () => {
    const v = new Vector(new Float32Array([1, 2]), 2);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.size).toBe(2);
    expect(v.lengthSquared).toBe(5); // 1^2 + 2^2
    expect(v.length).toBe(Math.sqrt(5)); // sqrt(1^2 + 2^2)
    expect(v.dot(new Vector(new Float32Array([3, 4]), 2))).toBe(11);
    expect(v.equals(new Vector(new Float32Array([1, 2]), 2))).toBe(true);
    expect(v.equals(new Vector(new Float32Array([3, 4]), 2))).toBe(false);
    expect(v.equals(new Vector(new Float32Array([1, 2]), 3))).toBe(false);
    expect(v.equals(new Vector(new Float32Array([1, 2]), 2))).toBe(true);
  });

  it("initializes properly with implicit size", () => {
    const v = new Vector(new Float32Array([1, 2]));
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.size).toBe(2);
    expect(v.lengthSquared).toBe(5); // 1^2 + 2^2
    expect(v.length).toBe(Math.sqrt(5)); // sqrt(1^2 + 2^2)
    expect(v.dot(new Vector(new Float32Array([3, 4]), 2))).toBe(11);
    expect(v.equals(new Vector(new Float32Array([1, 2]), 2))).toBe(true);
    expect(v.equals(new Vector(new Float32Array([3, 4]), 2))).toBe(false);
    expect(v.equals(new Vector(new Float32Array([1, 2]), 3))).toBe(false);
    expect(v.equals(new Vector(new Float32Array([1, 2]), 2))).toBe(true);
  });

  it("initializes properly from array", () => {
    const v = Vector.fromArray([1, 2, 3], 3);
    expect(v.size).toBe(3);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.get(2)).toBe(3);
  });

  it("initializes properly from array with implicit size", () => {
    const v = Vector.fromArray([1, 2, 3]);
    expect(v.size).toBe(3);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.get(2)).toBe(3);
  });

  it("calculates dot product properly", () => {
    const v = new Vector(new Float32Array([1, 2, 3]), 3);
    const w = new Vector(new Float32Array([4, 5, 6]), 3);
    expect(v.dot(w)).toBe(1 * 4 + 2 * 5 + 3 * 6);
  });

  it("calculates equals properly", () => {
    const v = new Vector(new Float32Array([1, 2, 3]), 3);
    const w = new Vector(new Float32Array([1, 2, 3]), 3);
    expect(v.equals(w)).toBe(true);
    const x = new Vector(new Float32Array([1, 2, 4]), 3);
    expect(v.equals(x)).toBe(false);
    const y = new Vector(new Float32Array([1, 2]), 2);
    expect(v.equals(y)).toBe(false);
  });

  it("clones properly", () => {
    const v = new Vector(new Float32Array([1, 2, 3]), 3);
    const w = v.clone();
    expect(w.size).toBe(3);
    expect(w.get(0)).toBe(1);
    expect(w.get(1)).toBe(2);
    expect(w.get(2)).toBe(3);
    expect(w.data).not.toBe(v.data);
  });

  it("converts to array properly", () => {
    const v = new Vector(new Float32Array([1, 2, 3]), 3);
    const result = v.toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("converts to float32 array properly", () => {
    const v = new Vector(new Float32Array([1, 2, 3]), 3);
    const result = v.toFloat32Array();
    expect(result).toEqual(new Float32Array([1, 2, 3]));
  });

  it("converts to float64 array properly", () => {
    const v = new Vector(new Float64Array([1, 2, 3]), 3);
    const result = v.toFloat64Array();
    expect(result).toEqual(new Float64Array([1, 2, 3]));
  });

  it("converts to int8 array properly", () => {
    const v = new Vector(new Int8Array([1, 2, 3]), 3);
    const result = v.toInt8Array();
    expect(result).toEqual(new Int8Array([1, 2, 3]));
  });

  it("converts to int16 array properly", () => {
    const v = new Vector(new Int16Array([1, 2, 3]), 3);
    const result = v.toInt16Array();
    expect(result).toEqual(new Int16Array([1, 2, 3]));
  });

  it("converts to int32 array properly", () => {
    const v = new Vector(new Int32Array([1, 2, 3]), 3);
    const result = v.toInt32Array();
    expect(result).toEqual(new Int32Array([1, 2, 3]));
  });

  it("converts to uint16 array properly", () => {
    const v = new Vector(new Uint16Array([1, 2, 3]), 3);
    const result = v.toUint16Array();
    expect(result).toEqual(new Uint16Array([1, 2, 3]));
  });

  it("converts to uint8 array properly", () => {
    const v = new Vector(new Uint8Array([1, 2, 3]), 3);
    const result = v.toUint8Array();
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("converts to uint8 clamped array properly", () => {
    const v = new Vector(new Uint8ClampedArray([1, 2, 3]), 3);
    const result = v.toUint8ClampedArray();
    expect(result).toEqual(new Uint8ClampedArray([1, 2, 3]));
  });

  it("converts to uint32 array properly", () => {
    const v = new Vector(new Uint32Array([1, 2, 3]), 3);
    const result = v.toUint32Array();
    expect(result).toEqual(new Uint32Array([1, 2, 3]));
  });

  it("throws an error if the vector is not initialized", () => {
    expect(() => new Vector(new Float32Array([]), 0)).toThrow();
  });

  it("fills empty vector properly", () => {
    const v = new Vector(new Float32Array([]), 3);
    expect(v.get(0)).toBe(0);
    expect(v.get(1)).toBe(0);
    expect(v.get(2)).toBe(0);
  });

  it("fills vector properly", () => {
    const v = new Vector(new Float32Array([1, 2, 3]), 3);
    const result = v.fill(5);
    expect(result).toBe(v); // Should return same instance
    expect(v.get(0)).toBe(5);
    expect(v.get(1)).toBe(5);
    expect(v.get(2)).toBe(5);
  });
});

import { Vector2, Vector3, Vector4 } from "@arcanvas/math";
import { describe, expect, it } from "bun:test";

describe("Vector2", () => {
  it("initializes properly", () => {
    const v = Vector2.of(1, 2);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.size).toBe(2);
    expect(v.lengthSquared).toBe(5); // 1^2 + 2^2
    expect(v.length).toBe(Math.sqrt(5)); // sqrt(1^2 + 2^2)
    expect(v.dot(Vector2.of(3, 4))).toBe(11);
    expect(v.equals(Vector2.of(1, 2))).toBe(true);
    expect(v.equals(Vector2.of(3, 4))).toBe(false);
  });

  it("initializes properly with implicit size", () => {
    const v = Vector2.of(1, 2);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.size).toBe(2);
    expect(v.lengthSquared).toBe(5); // 1^2 + 2^2
    expect(v.length).toBe(Math.sqrt(5)); // sqrt(1^2 + 2^2)
    expect(v.dot(Vector2.of(3, 4))).toBe(11);
    expect(v.equals(Vector2.of(1, 2))).toBe(true);
    expect(v.equals(Vector2.of(3, 4))).toBe(false);
  });

  it("initializes properly from array", () => {
    const v = Vector2.fromArray([1, 2]);
    expect(v.size).toBe(2);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
  });

  it("converts to array properly", () => {
    const v = Vector2.of(1, 2);
    const result = v.toArray();
    expect(result).toEqual([1, 2]);
  });

  it("converts to float32 array properly", () => {
    const v = new Vector2(new Float32Array([1, 2]));
    const result = v.toFloat32Array();
    expect(result).toEqual(new Float32Array([1, 2]));
  });

  it("converts to float64 array properly", () => {
    const v = new Vector2(new Float64Array([1, 2]));
    const result = v.toFloat64Array();
    expect(result).toEqual(new Float64Array([1, 2]));
  });

  it("converts to int8 array properly", () => {
    const v = new Vector2(new Int8Array([1, 2]));
    const result = v.toInt8Array();
    expect(result).toEqual(new Int8Array([1, 2]));
  });

  it("converts to int16 array properly", () => {
    const v = new Vector2(new Int16Array([1, 2]));
    const result = v.toInt16Array();
    expect(result).toEqual(new Int16Array([1, 2]));
  });

  it("converts to int32 array properly", () => {
    const v = new Vector2(new Int32Array([1, 2]));
    const result = v.toInt32Array();
    expect(result).toEqual(new Int32Array([1, 2]));
  });

  it("converts to uint16 array properly", () => {
    const v = new Vector2(new Uint16Array([1, 2]));
    const result = v.toUint16Array();
    expect(result).toEqual(new Uint16Array([1, 2]));
  });

  it("converts to uint8 array properly", () => {
    const v = new Vector2(new Uint8Array([1, 2]));
    const result = v.toUint8Array();
    expect(result).toEqual(new Uint8Array([1, 2]));
  });

  it("converts to uint8 clamped array properly", () => {
    const v = new Vector2(new Uint8ClampedArray([1, 2]));
    const result = v.toUint8ClampedArray();
    expect(result).toEqual(new Uint8ClampedArray([1, 2]));
  });

  it("converts to uint32 array properly", () => {
    const v = new Vector2(new Uint32Array([1, 2]));
    const result = v.toUint32Array();
    expect(result).toEqual(new Uint32Array([1, 2]));
  });

  it("fills vector properly", () => {
    const v = new Vector2(new Float32Array([1, 2]));
    const result = v.fill(5);
    expect(result).toBe(v); // Should return same instance
    expect(v.get(0)).toBe(5);
    expect(v.get(1)).toBe(5);
  });

  it("tests mutating operations return this", () => {
    const v = Vector2.of(1, 2);
    const result = v.add(Vector2.of(1, 1));
    expect(result).toBe(v);
    expect(v.get(0)).toBe(2);
    expect(v.get(1)).toBe(3);
  });

  it("tests non-mutating operations create new instances", () => {
    const v = new Vector2(new Float32Array([1, 2]));
    const cloned = v.clone();
    expect(cloned).not.toBe(v);
    expect(cloned.get(0)).toBe(1);
    expect(cloned.get(1)).toBe(2);
    // Original should be unchanged
    expect(v.get(0)).toBe(1);
  });
});

describe("Vector2 specific", () => {
  it("creates from of() factory", () => {
    const v = Vector2.of(1, 2);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.size).toBe(2);
  });

  it("creates from fromArray()", () => {
    const v = Vector2.fromArray([1, 2]);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
  });

  it("clones with correct type", () => {
    const v = Vector2.of(1, 2);
    const cloned = v.clone();
    expect(cloned).toBeInstanceOf(Vector2);
    expect(cloned.x).toBe(1);
    expect(cloned.y).toBe(2);
  });
});

describe("Vector3", () => {
  it("initializes properly", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.get(2)).toBe(3);
    expect(v.size).toBe(3);
    expect(v.lengthSquared).toBe(14); // 1^2 + 2^2 + 3^2
    expect(v.length).toBe(Math.sqrt(14));
    expect(v.dot(new Vector3(new Float32Array([4, 5, 6])))).toBe(1 * 4 + 2 * 5 + 3 * 6);
    expect(v.equals(new Vector3(new Float32Array([1, 2, 3])))).toBe(true);
    expect(v.equals(new Vector3(new Float32Array([1, 2, 4])))).toBe(false);
  });

  it("initializes properly from array", () => {
    const v = Vector3.fromArray([1, 2, 3]);
    expect(v.size).toBe(3);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.get(2)).toBe(3);
  });

  it("calculates dot product properly", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    const w = new Vector3(new Float32Array([4, 5, 6]));
    expect(v.dot(w)).toBe(1 * 4 + 2 * 5 + 3 * 6);
  });

  it("calculates equals properly", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    const w = new Vector3(new Float32Array([1, 2, 3]));
    expect(v.equals(w)).toBe(true);
    const x = new Vector3(new Float32Array([1, 2, 4]));
    expect(v.equals(x)).toBe(false);
    const y = new Vector3(new Float32Array([1, 2]));
    expect(v.equals(y)).toBe(false);
  });

  it("clones properly", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    const w = v.clone();
    expect(w.size).toBe(3);
    expect(w.get(0)).toBe(1);
    expect(w.get(1)).toBe(2);
    expect(w.get(2)).toBe(3);
    expect(w.data).not.toBe(v.data);
  });

  it("converts to array properly", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    const result = v.toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("fills vector properly", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    const result = v.fill(5);
    expect(result).toBe(v); // Should return same instance
    expect(v.get(0)).toBe(5);
    expect(v.get(1)).toBe(5);
    expect(v.get(2)).toBe(5);
  });

  it("tests mutating operations return this", () => {
    const v = new Vector3(new Float32Array([1, 2, 3]));
    const result = v.add(new Vector3(new Float32Array([1, 1, 1])));
    expect(result).toBe(v);
    expect(v.get(0)).toBe(2);
    expect(v.get(1)).toBe(3);
    expect(v.get(2)).toBe(4);
  });

  it("creates from of() factory", () => {
    const v = Vector3.of(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
    expect(v.size).toBe(3);
  });

  it("creates from fromArray()", () => {
    const v = Vector3.fromArray([1, 2, 3]);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  it("calculates cross product properly", () => {
    const a = Vector3.of(1, 0, 0);
    const b = Vector3.of(0, 1, 0);
    const result = a.clone().cross(b);
    // cross(1,0,0) x (0,1,0) = (0,0,1)
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(1);
  });

  it("cross product mutates the vector", () => {
    const a = Vector3.of(1, 0, 0);
    const b = Vector3.of(0, 1, 0);
    const result = a.cross(b);
    expect(result).toBe(a); // Should return same instance
    expect(a.z).toBe(1);
  });

  it("clones with correct type", () => {
    const v = Vector3.of(1, 2, 3);
    const cloned = v.clone();
    expect(cloned).toBeInstanceOf(Vector3);
    expect(cloned.x).toBe(1);
    expect(cloned.y).toBe(2);
    expect(cloned.z).toBe(3);
  });
});

describe("Vector4", () => {
  it("initializes properly", () => {
    const v = new Vector4(new Float32Array([1, 2, 3, 4]));
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.get(2)).toBe(3);
    expect(v.get(3)).toBe(4);
    expect(v.size).toBe(4);
  });

  it("initializes properly from array", () => {
    const v = Vector4.fromArray([1, 2, 3, 4]);
    expect(v.size).toBe(4);
    expect(v.get(0)).toBe(1);
    expect(v.get(1)).toBe(2);
    expect(v.get(2)).toBe(3);
    expect(v.get(3)).toBe(4);
  });

  it("calculates dot product properly", () => {
    const v = new Vector4(new Float32Array([1, 2, 3, 4]));
    const w = new Vector4(new Float32Array([5, 6, 7, 8]));
    expect(v.dot(w)).toBe(1 * 5 + 2 * 6 + 3 * 7 + 4 * 8);
  });

  it("clones properly", () => {
    const v = new Vector4(new Float32Array([1, 2, 3, 4]));
    const w = v.clone();
    expect(w.size).toBe(4);
    expect(w.get(0)).toBe(1);
    expect(w.get(1)).toBe(2);
    expect(w.get(2)).toBe(3);
    expect(w.get(3)).toBe(4);
    expect(w.data).not.toBe(v.data);
  });

  it("creates from of() factory", () => {
    const v = Vector4.of(1, 2, 3, 4);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
    expect(v.w).toBe(4);
    expect(v.size).toBe(4);
  });

  it("creates from fromArray()", () => {
    const v = Vector4.fromArray([1, 2, 3, 4]);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
    expect(v.w).toBe(4);
  });

  it("clones with correct type", () => {
    const v = Vector4.of(1, 2, 3, 4);
    const cloned = v.clone();
    expect(cloned).toBeInstanceOf(Vector4);
    expect(cloned.x).toBe(1);
    expect(cloned.y).toBe(2);
    expect(cloned.z).toBe(3);
    expect(cloned.w).toBe(4);
  });
});

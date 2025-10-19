import { BigInt64Matrix2x2, Float32Matrix2x2, Float32Matrix2x3, Float32Matrix3x2, GenericMatrix2x2 } from "@arcanvas/matrix";
import { describe, expect, it } from "bun:test";

describe("Matrix (dynamic)", () => {
  it("constructs from array", () => {
    const m = new Float32Matrix2x2(1, 2, 3, 4);
    expect(m.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("constructs from array-like", () => {
    const C = Float32Matrix2x2 as unknown as {
      fromValues(values: ArrayLike<number> | Iterable<number>): { toArray(): number[] };
    };
    const m = C.fromValues([1, 2, 3, 4]);
    expect(m.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("multiplies matrices", () => {
    const m = new Float32Matrix2x2(1, 2, 3, 4);
    const n = new Float32Matrix2x2(5, 6, 7, 8);
    const p = m.matMul(n);
    expect(p.toArray()).toEqual([19, 22, 43, 50]);
  });

  it("multiplies matrices with different shapes", () => {
    const m = new Float32Matrix2x2(1, 2, 3, 4);
    const n = new Float32Matrix2x3(5, 6, 7, 8, 9, 10);
    const p = m.matMul(n);
    // m (2x2): [1 2; 3 4]
    // n (2x3): [5 6 7; 8 9 10]
    // p should be (2x3):
    // Row 0: [1*5 + 2*8, 1*6 + 2*9, 1*7 + 2*10] = [5+16, 6+18, 7+20] = [21, 24, 27]
    // Row 1: [3*5 + 4*8, 3*6 + 4*9, 3*7 + 4*10] = [15+32, 18+36, 21+40] = [47, 54, 61]
    expect(p.toArray()).toEqual([21, 24, 27, 47, 54, 61]);
  });

  it("constructs from nested arrays via fromValues", () => {
    const C = Float32Matrix2x2 as unknown as {
      fromValues(values: number[][]): { toArray(): number[] };
    };
    const m = C.fromValues([
      [1, 2],
      [3, 4],
    ]);
    expect(m.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("getN/setN works with coordinates", () => {
    const m = new Float32Matrix2x2(0, 0, 0, 0);
    m.setN(42, 1, 0);
    expect(m.getN(1, 0)).toBe(42);
    expect(m.toArray()).toEqual([0, 0, 42, 0]);
  });

  it("add/sub/scale/dot/magnitude/normalized", () => {
    const a = new Float32Matrix2x2(1, 2, 3, 4);
    const b = new Float32Matrix2x2(5, 6, 7, 8);
    const add = a.add(b);
    const sub = a.sub(b);
    const sc = a.scale(2);
    const dot = a.dot(b);
    const mag = a.magnitude();
    const norm = a.normalized();
    expect(add.toArray()).toEqual([6, 8, 10, 12]);
    expect(sub.toArray()).toEqual([-4, -4, -4, -4]);
    expect(sc.toArray()).toEqual([2, 4, 6, 8]);
    expect(dot).toBe(1 * 5 + 2 * 6 + 3 * 7 + 4 * 8);
    expect(Math.abs(mag - Math.hypot(1, 2, 3, 4)) < 1e-6).toBe(true);
    // normalized then re-scale back
    const back = norm.scale(mag);
    const backArr = back.toArray();
    const orig = [1, 2, 3, 4];
    for (let i = 0; i < 4; i++) expect(Math.abs(backArr[i]! - orig[i]!) < 1e-5).toBe(true);
  });

  it("matMul 3x2 x 2x3 -> 3x3", () => {
    const a = new Float32Matrix3x2(1, 2, 3, 4, 5, 6);
    const b = new Float32Matrix2x3(7, 8, 9, 10, 11, 12);
    const p = a.matMul(b);
    // Expected using plain math
    expect(p.toArray()).toEqual([1 * 7 + 2 * 10, 1 * 8 + 2 * 11, 1 * 9 + 2 * 12, 3 * 7 + 4 * 10, 3 * 8 + 4 * 11, 3 * 9 + 4 * 12, 5 * 7 + 6 * 10, 5 * 8 + 6 * 11, 5 * 9 + 6 * 12]);
  });

  it("matMul shape mismatch throws", () => {
    const a = new Float32Matrix2x2(1, 2, 3, 4);
    const bad = new Float32Matrix3x2(1, 2, 3, 4, 5, 6);
    expect(() => a.matMul(bad as unknown as InstanceType<typeof Float32Matrix2x3>)).toThrow();
  });

  it("BigInt fromValues with mixed inputs and ops", () => {
    const C = BigInt64Matrix2x2 as unknown as {
      fromValues(values: ArrayLike<bigint | number | string> | Iterable<bigint | number | string>): {
        toArray(): bigint[];
        add(other: unknown): { toArray(): bigint[] };
        scale(s: bigint | number): { toArray(): bigint[] };
      };
    };
    const m = C.fromValues([1n, 2, "3", 4]);
    const n = C.fromValues([5, 6, 7, 8]);
    const add = m.add(n);
    const sc = m.scale(2);
    expect(m.toArray()).toEqual([1n, 2n, 3n, 4n]);
    expect(add.toArray()).toEqual([6n, 8n, 10n, 12n]);
    expect(sc.toArray()).toEqual([2n, 4n, 6n, 8n]);
  });

  it("Generic matrix toNested", () => {
    const G = GenericMatrix2x2.fromValues([
      [9, 8],
      [7, 6],
    ]);
    const nested = (G as unknown as { toNested(): unknown }).toNested() as number[][];
    expect(nested).toEqual([
      [9, 8],
      [7, 6],
    ]);
  });
});

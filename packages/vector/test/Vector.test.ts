import { Float32Vector2, Float32Vector3 } from "@arcanvas/vector";
import { describe, expect, it } from "bun:test";

describe("Vector", () => {
  it("Float32Vector2 basic operations", () => {
    const v = new Float32Vector2(1, 2);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);

    v.x = 3;
    expect(v.x).toBe(3);
    expect(v.y).toBe(2);
  });

  it("Float32Vector2 toTypedArray", () => {
    const v = new Float32Vector2(1, 2);
    const arr = v.toTypedArray();
    expect(arr.length).toBe(2);
    expect(arr[0]).toBe(1);
    expect(arr[1]).toBe(2);
  });

  it("Float32Vector2 toRowMajorArray", () => {
    const v = new Float32Vector2(1, 2);
    const arr = v.toArray();
    expect(arr.length).toBe(2);
    expect(arr[0]).toBe(1);
    expect(arr[1]).toBe(2);
  });

  it("Float32Vector2 rotateMajorOrder preserves logical access", () => {
    const v = new Float32Vector2(1, 2);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);

    v.add(new Float32Vector2(3, 4));
    expect(v.x).toBe(4);
    expect(v.y).toBe(6);
  });
});

describe("Vector3", () => {
  it("Float32Vector3 basic operations", () => {
    const v = new Float32Vector3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);

    v.z = 4;
    expect(v.z).toBe(4);
  });

  it("Float32Vector3 toTypedArray", () => {
    const v = new Float32Vector3(1, 2, 3);
    const arr = v.toTypedArray();
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
    expect(arr[1]).toBe(2);
    expect(arr[2]).toBe(3);
  });

  it("Float32Vector3 toArray", () => {
    const v = new Float32Vector3(1, 2, 3);
    const arr = v.toArray();
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
    expect(arr[1]).toBe(2);
    expect(arr[2]).toBe(3);
  });

  it("Float32Vector3 rotateMajorOrder preserves logical access", () => {
    const v = new Float32Vector3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);

    v.add(new Float32Vector3(3, 4, 5));
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  it("Float32Vector3 bounds checking", () => {
    const v = new Float32Vector3(1, 2, 3);
    expect(() => v.get(3)).toThrow(); // out of bounds
    expect(() => v.set(3, 42)).toThrow(); // out of bounds
  });
});

import type { NumberArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector2 is a 2D vector of 32-bit floating point numbers.
 */
export class Vector2<T extends NumberArray = Float32Array> extends Vector<T, 2> {
  constructor(data?: T) {
    super(data ?? (new Float32Array(2) as T), 2);
  }

  get x(): number {
    return this._data[0] as number;
  }
  set x(v: number) {
    this._data[0] = v;
  }

  get y(): number {
    return this._data[1] as number;
  }
  set y(v: number) {
    this._data[1] = v;
  }

  /**
   * Creates a Vector2 from individual components.
   * @param x - The x component (default: 0).
   * @param y - The y component (default: 0).
   * @returns A new Vector2 instance.
   */
  static of(x = 0, y = 0): Vector2<Float32Array> {
    const arr = new Float32Array(2);
    arr[0] = x;
    arr[1] = y;
    return new Vector2(arr);
  }

  /**
   * Creates a Vector2 from an array-like object.
   * @param array - The array-like object.
   * @param _size - Optional size (ignored, always 2 for Vector2).
   * @returns A new Vector2 instance.
   */

  static fromArray<TNewArr extends NumberArray = Float32Array>(array: ArrayLike<number>): Vector2<TNewArr> {
    const arr = new Float32Array(2) as TNewArr;
    const len = Math.min(2, array.length);
    for (let i = 0; i < len; i++) {
      arr[i] = (array[i] ?? 0) as TNewArr[number];
    }
    return new Vector2(arr);
  }

  /**
   * Creates a Vector2 view into an existing ArrayBuffer.
   * @param buffer - The array buffer.
   * @param byteOffset - The byte offset (default: 0).
   * @returns A new Vector2 instance.
   */
  static fromBuffer(buffer: ArrayBuffer, byteOffset = 0): Vector2<Float32Array> {
    const arr = new Float32Array(buffer, byteOffset, 2);
    return new Vector2(arr);
  }
}

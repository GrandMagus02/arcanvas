import type { NumberArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector4 is a 4D vector of 32-bit floating point numbers.
 */
export class Vector4<T extends NumberArray = Float32Array> extends Vector<T, 4> {
  constructor(data?: T) {
    super(data ?? (new Float32Array(4) as T), 4);
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

  get z(): number {
    return this._data[2] as number;
  }
  set z(v: number) {
    this._data[2] = v;
  }

  get w(): number {
    return this._data[3] as number;
  }
  set w(v: number) {
    this._data[3] = v;
  }

  /**
   * Creates a Vector4 from individual components.
   * @param x - The x component (default: 0).
   * @param y - The y component (default: 0).
   * @param z - The z component (default: 0).
   * @param w - The w component (default: 0).
   * @returns A new Vector4 instance.
   */
  static of(x = 0, y = 0, z = 0, w = 0): Vector4<Float32Array> {
    const arr = new Float32Array(4);
    arr[0] = x;
    arr[1] = y;
    arr[2] = z;
    arr[3] = w;
    return new Vector4(arr);
  }

  /**
   * Creates a Vector4 from an array-like object.
   * @param array - The array-like object.
   * @param _size - Optional size (ignored, always 4 for Vector4).
   * @returns A new Vector4 instance.
   */

  static fromArray<TNewArr extends NumberArray = Float32Array>(array: ArrayLike<number>): Vector4<TNewArr> {
    const arr = new Float32Array(4) as TNewArr;
    const len = Math.min(4, array.length);
    for (let i = 0; i < len; i++) {
      arr[i] = (array[i] ?? 0) as TNewArr[number];
    }
    return new Vector4(arr);
  }

  /**
   * Creates a Vector4 view into an existing ArrayBuffer.
   * @param buffer - The array buffer.
   * @param byteOffset - The byte offset (default: 0).
   * @returns A new Vector4 instance.
   */
  static fromBuffer(buffer: ArrayBuffer, byteOffset = 0): Vector4<Float32Array> {
    const arr = new Float32Array(buffer, byteOffset, 4);
    return new Vector4(arr);
  }
}

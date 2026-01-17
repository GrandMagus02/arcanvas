import type { NumberArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector3 is a 3D vector of 32-bit floating point numbers.
 */
export class Vector3<T extends NumberArray = Float32Array> extends Vector<T, 3> {
  constructor(data?: T) {
    super(data ?? (new Float32Array(3) as T), 3);
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

  /**
   * Calculates the cross product of this vector and the other vector.
   * The cross product is only defined for 3D vectors.
   * @param other - The other vector.
   * @returns This vector after computing the cross product (mutates this).
   */
  cross(other: this): this {
    this.ensureSameSize(other);
    const ax = this._data[0] as number;
    const ay = this._data[1] as number;
    const az = this._data[2] as number;
    const bx = other._data[0] as number;
    const by = other._data[1] as number;
    const bz = other._data[2] as number;

    this._data[0] = ay * bz - az * by;
    this._data[1] = az * bx - ax * bz;
    this._data[2] = ax * by - ay * bx;
    return this;
  }

  /**
   * Creates a Vector3 from individual components.
   * @param x - The x component (default: 0).
   * @param y - The y component (default: 0).
   * @param z - The z component (default: 0).
   * @returns A new Vector3 instance.
   */
  static of(x = 0, y = 0, z = 0): Vector3<Float32Array> {
    const arr = new Float32Array(3);
    arr[0] = x;
    arr[1] = y;
    arr[2] = z;
    return new Vector3(arr);
  }

  /**
   * Creates a Vector3 from an array-like object.
   * @param array - The array-like object.
   * @param _size - Optional size (ignored, always 3 for Vector3).
   * @returns A new Vector3 instance.
   */
  static fromArray<TNewArr extends NumberArray = Float32Array>(array: ArrayLike<number>): Vector3<TNewArr> {
    const arr = new Float32Array(3) as TNewArr;
    const len = Math.min(3, array.length);
    for (let i = 0; i < len; i++) {
      arr[i] = (array[i] ?? 0) as TNewArr[number];
    }
    return new Vector3(arr);
  }

  /**
   * Creates a Vector3 view into an existing ArrayBuffer.
   * @param buffer - The array buffer.
   * @param byteOffset - The byte offset (default: 0).
   * @returns A new Vector3 instance.
   */
  static fromBuffer(buffer: ArrayBuffer, byteOffset = 0): Vector3<Float32Array> {
    const arr = new Float32Array(buffer, byteOffset, 3);
    return new Vector3(arr);
  }
}

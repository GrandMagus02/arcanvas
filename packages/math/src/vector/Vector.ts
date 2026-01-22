import { Matrix } from "../matrix/Matrix";
import type { NumberArray, NumberArrayConstructor, TypedArray } from "../vector/types";

/**
 * Vector is a 1D vector of 32-bit floating point numbers.
 */
export class Vector<TArr extends NumberArray, TSize extends number = TArr["length"]> extends Matrix<TArr, TSize, 1> {
  constructor(data: TArr, size?: TSize, validate = true) {
    const ctor = data.constructor as unknown as NumberArrayConstructor;
    const n = (size ?? (data.length as TSize)) as number;
    let arr = data;

    if (validate) {
      const out = new ctor(n) as TArr;
      if (Array.isArray(out)) {
        out.splice(0, out.length, ...data);
      } else {
        (out as unknown as TypedArray).set(data as unknown as TypedArray);
      }
      for (let i = 0; i < n; i++) {
        const v = out[i] as number;
        out[i] = v === undefined || isNaN(v) || !isFinite(v) ? (0 as TArr[number]) : (v as TArr[number]);
      }
      arr = out;
    } else if (data.length !== n) {
      const out = new ctor(n) as TArr;
      (out as unknown as TypedArray).set(data as unknown as TypedArray);
      arr = out;
    }

    super(arr, n as TSize, 1);
  }

  /**
   * Gets the value at the given index.
   * @param i - The index.
   * @returns The value at the given index.
   */
  override get(i: number): number {
    if (i < 0 || i >= (this.size as number)) throw new RangeError("Index out of bounds");
    return this.data[i] as number; // при cols=1 индекс совпадает с r
  }

  /**
   * Sets the value at the given index.
   * @param i - The index.
   * @param value - The value to set.
   * @returns The matrix.
   */
  override set(i: number, value: number): this {
    if (i < 0 || i >= (this.size as number)) throw new RangeError("Index out of bounds");
    // Matrix хранит column-major: индекс = c*rows + r = 0*rows + i = i
    this.data[i] = value as TArr[number];
    return this;
  }

  /**
   * Gets the size of the vector.
   * @returns The size of the vector.
   */
  override get size(): TSize {
    return this.cols;
  }

  /**
   * Gets the squared length of the vector.
   * @returns The squared length of the vector.
   */
  get lengthSquared(): number {
    let s = 0;
    for (let i = 0; i < (this.size as number); i++) s += (this.data[i] as number) ** 2;
    return s;
  }

  /**
   * Gets the length of the vector.
   * @returns The length of the vector.
   */
  get length(): number {
    return Math.sqrt(this.lengthSquared);
  }

  /**
   * Scales the vector by a scalar.
   * @param scalar - The scalar.
   * @returns The scaled vector.
   */
  scale(scalar: number): this {
    for (let i = 0; i < (this.size as number); i++) this.data[i] = ((this.data[i] as number) * scalar) as TArr[number];
    return this;
  }

  /**
   * Normalizes the vector.
   * @returns The normalized vector.
   */
  normalize(): this {
    const len = this.length;
    if (len > 0) this.scale(1 / len);
    else for (let i = 0; i < (this.size as number); i++) this.data[i] = 0 as TArr[number];
    return this;
  }
}

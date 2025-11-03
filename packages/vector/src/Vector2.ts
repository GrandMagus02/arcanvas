import type { TypedArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector2Base is a base class for all 2D vectors.
 * @extends {Vector<TArr>} - The base vector class.
 * @template TArr - The typed array constructor.
 * @param data - The data of the vector.
 * @returns {Vector2Base<TArr>}
 * @example
 * ```ts
 * const vector = new Vector2Base<Float32Array>(new Float32Array([1, 2]));
 * console.log(vector.x); // 1
 * console.log(vector.y); // 2
 * ```
 */
export abstract class Vector2Base<TArr extends TypedArray> extends Vector<TArr> {
  protected constructor(data: TArr) {
    super(data);
    if (data.length !== 2) {
      throw new Error("Vector2 requires exactly 2 components");
    }
  }

  get x(): number {
    return this._data[0]!;
  }
  set x(v: number) {
    this._data[0] = v;
  }

  get y(): number {
    return this._data[1]!;
  }
  set y(v: number) {
    this._data[1] = v;
  }

  // Polymorphic static: returns the concrete subclass type
  static from<TArr extends TypedArray, TSelf extends Vector2Base<TArr>>(this: new (x: number, y: number) => TSelf, src: ArrayLike<number>): TSelf {
    if (src.length < 2) {
      throw new Error("Vector2.from requires at least 2 elements");
    }
    return new this(src[0]!, src[1]!);
  }
}

/**
 * Uint8Vector2 is a 2D vector of unsigned 8-bit integers.
 */
export class Uint8Vector2 extends Vector2Base<Uint8Array> {
  constructor(x: number, y: number) {
    super(new Uint8Array([x, y]));
  }
  protected newOfData(arr: Uint8Array): this {
    return new Uint8Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Int8Vector2 is a 2D vector of signed 8-bit integers.
 */
export class Int8Vector2 extends Vector2Base<Int8Array> {
  constructor(x: number, y: number) {
    super(new Int8Array([x, y]));
  }
  protected newOfData(arr: Int8Array): this {
    return new Int8Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Int16Vector2 is a 2D vector of signed 16-bit integers.
 */
export class Int16Vector2 extends Vector2Base<Int16Array> {
  constructor(x: number, y: number) {
    super(new Int16Array([x, y]));
  }
  protected newOfData(arr: Int16Array): this {
    return new Int16Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Uint16Vector2 is a 2D vector of unsigned 16-bit integers.
 */
export class Uint16Vector2 extends Vector2Base<Uint16Array> {
  constructor(x: number, y: number) {
    super(new Uint16Array([x, y]));
  }
  protected newOfData(arr: Uint16Array): this {
    return new Uint16Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Float32Vector2 is a 2D vector of 32-bit floating point numbers.
 */
export class Float32Vector2 extends Vector2Base<Float32Array> {
  constructor(x: number, y: number) {
    super(new Float32Array([x, y]));
  }
  protected newOfData(arr: Float32Array): this {
    return new Float32Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Float64Vector2 is a 2D vector of 64-bit floating point numbers.
 */
export class Float64Vector2 extends Vector2Base<Float64Array> {
  constructor(x: number, y: number) {
    super(new Float64Array([x, y]));
  }
  protected newOfData(arr: Float64Array): this {
    return new Float64Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Int32Vector2 is a 2D vector of signed 32-bit integers.
 */
export class Int32Vector2 extends Vector2Base<Int32Array> {
  constructor(x: number, y: number) {
    super(new Int32Array([x, y]));
  }
  protected newOfData(arr: Int32Array): this {
    return new Int32Vector2(arr[0]!, arr[1]!) as this;
  }
}

/**
 * Uint8ClampedVector2 is a 2D vector of unsigned 8-bit integers that are clamped to the range [0, 255].
 */
export class Uint8ClampedVector2 extends Vector2Base<Uint8ClampedArray> {
  constructor(x: number, y: number) {
    super(new Uint8ClampedArray([x, y]));
  }
  protected newOfData(arr: Uint8ClampedArray): this {
    return new Uint8ClampedVector2(arr[0]!, arr[1]!) as this;
  }
}

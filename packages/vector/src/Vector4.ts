import type { TypedArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector4Base is a base class for all 4D vectors.
 * @param TArr - The typed array constructor.
 * @param data - The data of the vector.
 */
export abstract class Vector4Base<TArr extends TypedArray> extends Vector<TArr> {
  protected constructor(data: TArr) {
    super(data);
    if (data.length !== 4) {
      throw new Error("Vector4 requires exactly 4 components");
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

  get z(): number {
    return this._data[2]!;
  }
  set z(v: number) {
    this._data[2] = v;
  }

  get w(): number {
    return this._data[3]!;
  }
  set w(v: number) {
    this._data[3] = v;
  }

  // Polymorphic static: returns the concrete subclass type
  static from<TArr extends TypedArray, TSelf extends Vector4Base<TArr>>(this: new (x: number, y: number, z: number, w: number) => TSelf, src: ArrayLike<number>): TSelf {
    if (src.length < 4) {
      throw new Error("Vector4.from requires at least 4 elements");
    }
    return new this(src[0]!, src[1]!, src[2]!, src[3]!);
  }
}

/**
 * Uint8Vector4 is a 4D vector of unsigned 8-bit integers.
 */
export class Uint8Vector4 extends Vector4Base<Uint8Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Uint8Array([x, y, z, w]));
  }
  protected newOfData(arr: Uint8Array): this {
    return new Uint8Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Int8Vector4 is a 4D vector of signed 8-bit integers.
 */
export class Int8Vector4 extends Vector4Base<Int8Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Int8Array([x, y, z, w]));
  }
  protected newOfData(arr: Int8Array): this {
    return new Int8Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Int16Vector4 is a 4D vector of signed 16-bit integers.
 */
export class Int16Vector4 extends Vector4Base<Int16Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Int16Array([x, y, z, w]));
  }
  protected newOfData(arr: Int16Array): this {
    return new Int16Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Uint16Vector4 is a 4D vector of unsigned 16-bit integers.
 */
export class Uint16Vector4 extends Vector4Base<Uint16Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Uint16Array([x, y, z, w]));
  }
  protected newOfData(arr: Uint16Array): this {
    return new Uint16Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Float32Vector4 is a 4D vector of 32-bit floating point numbers.
 */
export class Float32Vector4 extends Vector4Base<Float32Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Float32Array([x, y, z, w]));
  }
  protected newOfData(arr: Float32Array): this {
    return new Float32Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Float64Vector4 is a 4D vector of 64-bit floating point numbers.
 */
export class Float64Vector4 extends Vector4Base<Float64Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Float64Array([x, y, z, w]));
  }
  protected newOfData(arr: Float64Array): this {
    return new Float64Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Int32Vector4 is a 4D vector of signed 32-bit integers.
 */
export class Int32Vector4 extends Vector4Base<Int32Array> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Int32Array([x, y, z, w]));
  }
  protected newOfData(arr: Int32Array): this {
    return new Int32Vector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

/**
 * Uint8ClampedVector4 is a 4D vector of unsigned 8-bit integers that are clamped to the range [0, 255].
 */
export class Uint8ClampedVector4 extends Vector4Base<Uint8ClampedArray> {
  constructor(x: number, y: number, z: number, w: number) {
    super(new Uint8ClampedArray([x, y, z, w]));
  }
  protected newOfData(arr: Uint8ClampedArray): this {
    return new Uint8ClampedVector4(arr[0]!, arr[1]!, arr[2]!, arr[3]!) as this;
  }
}

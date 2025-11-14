import type { NumberArray, NumberArrayConstructor, TypedArray, TypedArrayConstructor } from "./types";

/**
 * WebGL-friendly BaseVector with support for:
 * - Owned storage (allocates own typed array)
 * - Views over shared buffers (ArrayBuffer or existing NumberArray + byteOffset)
 *
 * Notes:
 * - Prefer Float32Array for WebGL attributes.
 * - For large collections, create many vectors as views into one big typed array.
 */
export class Vector<TArr extends NumberArray, TSize extends number> {
  /**
   * The data of the vector.
   */
  protected readonly _data: TArr;
  /**
   * The size of the vector.
   */
  protected readonly _size: TSize;

  /**
   * Create from an existing typed array instance (owned or a view).
   * Use this when you already have a correctly-sized TArr slice/view.
   * @param data - The data of the vector.
   */
  constructor(data: TArr, size?: TSize) {
    if ((data.length <= 0 && size === undefined) || (size !== undefined && size <= 0)) {
      throw new RangeError("Vector dimensions must be positive or the data must have a length");
    }
    this._size = size ?? (data.length as TSize);
    this._data = this.validateData(data);
  }

  /**
   * Validates a value.
   * @param value - The value to validate.
   * @returns The validated value.
   */
  protected validateValue(value: number): number {
    if (value === undefined || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return value;
  }

  /**
   * Validates the data of the vector.
   * @param data - The data of the vector.
   */
  protected validateData(data: TArr): TArr {
    const newData = new (data.constructor as unknown as NumberArrayConstructor)(this.size) as TArr;
    if (Array.isArray(newData)) {
      newData.splice(0, newData.length, ...data);
    } else {
      newData.fill(0);
      (newData as unknown as TypedArray).set(data as unknown as TypedArray);
    }
    for (let i = 0; i < this.size; i++) {
      newData[i] = this.validateValue(data[i]!);
    }
    return newData;
  }

  /**
   * Returns the data of the vector.
   * @returns The data.
   */
  get data(): TArr {
    return this._data;
  }

  /**
   * Returns the size of the vector.
   * @returns The size.
   */
  get size(): TSize {
    return this._size;
  }

  /**
   * Returns the squared length of the vector.
   * @returns The squared length.
   */
  get lengthSquared(): number {
    let s = 0;
    for (let i = 0; i < this._size; i++) {
      const v = this._data[i]!;
      // non-null assertion is unnecessary for typed arrays; keep direct access
      s += v * v;
    }
    return s;
  }

  /**
   * Returns the length of the vector.
   * @returns The length.
   */
  get length(): number {
    return Math.sqrt(this.lengthSquared);
  }

  /**
   * Creates a vector from an array.
   * @param array - The array.
   * @param size - The size of the vector.
   * @returns The new vector.
   */
  static fromArray<TNewArr extends NumberArray, TNewSize extends number>(array: ArrayLike<number>, size?: TNewSize): Vector<TNewArr, TNewSize> {
    const ctor = array.constructor as unknown as NumberArrayConstructor;
    if (size === undefined) {
      size = array.length as TNewSize;
    }
    const data = new ctor(size) as TNewArr;
    if (Array.isArray(data)) {
      data.splice(0, data.length, ...Array.from(array));
    } else {
      (data as unknown as TypedArray).set(array as unknown as TypedArray);
    }
    return new Vector<TNewArr, TNewSize>(data, size);
  }

  /**
   * Allocates an owned vector of given dimension using a typed array constructor.
   * @param ctor - The typed array constructor.
   * @param dimension - The dimension.
   * @param init - The initial values.
   * @returns The allocated vector.
   */
  protected static alloc<TArr extends NumberArray, TSize extends number, TSelf extends Vector<TArr, TSize>>(
    this: { new (data: TArr): TSelf },
    ctor: NumberArrayConstructor,
    dimension: number,
    init?: ArrayLike<number>
  ): TSelf {
    const arr = new ctor(dimension) as TArr;
    if (init && init.length > 0) {
      const n = Math.min(dimension, init.length);
      for (let i = 0; i < n; i++) {
        arr[i] = init[i]!;
      }
      for (let i = n; i < dimension; i++) {
        arr[i] = 0;
      }
    }
    return new this(arr);
  }

  /**
   * Ensures that the current vector has the same size as the other vector.
   * @param other - The other vector.
   * @throws {RangeError} If the vectors have different sizes.
   */
  protected ensureSameSize(other: Vector<TArr, TSize>): void {
    if (this._size !== other._size) {
      throw new RangeError("Vector sizes do not match");
    }
  }

  /**
   * Check if a value is a Vector.
   * @param value - The value to check.
   * @returns True if the value is a Vector.
   */
  static isVector(value: unknown): value is Vector<NumberArray, number> {
    return value instanceof Vector;
  }

  /**
   * Create a view into an existing ArrayBuffer.
   * @param ctor - The typed array constructor.
   * @param buffer - The array buffer.
   * @param byteOffset - The byte offset.
   * @param count - The number of elements.
   * @returns The view.
   */
  protected static fromBuffer<TArr extends TypedArray, TSize extends number, TSelf extends Vector<TArr, TSize>>(
    this: { new (data: TArr): TSelf },
    ctor: TypedArrayConstructor,
    buffer: ArrayBuffer,
    byteOffset: number,
    count: number
  ): TSelf {
    const arr = new ctor(buffer, byteOffset, count) as TArr;
    return new this(arr);
  }

  /**
   * Returns a view from an existing typed array plus an element offset.
   * @param source - The source typed array.
   * @param elementOffset - The element offset.
   * @param count - The number of elements.
   * @returns The view.
   */
  protected static fromArrayView<TArr extends TypedArray, TSize extends number, TSelf extends Vector<TArr, TSize>>(
    this: { new (data: TArr): TSelf },
    source: TArr,
    elementOffset: number,
    count: number
  ): TSelf {
    const view = source.subarray
      ? (source.subarray(elementOffset, elementOffset + count) as TArr)
      : (new (source.constructor as unknown as TypedArrayConstructor)(
          source.buffer as ArrayBuffer,
          (source as unknown as { byteOffset: number }).byteOffset + elementOffset * (source as unknown as { BYTES_PER_ELEMENT: number }).BYTES_PER_ELEMENT,
          count
        ) as TArr);
    return new this(view);
  }

  /**
   * Returns the value at the given index.
   * @param i - The index.
   * @returns The value.
   */
  get(i: number): number {
    if (i < 0 || i >= this._size) {
      throw new RangeError("Index out of bounds");
    }
    return this._data[i] as number;
  }

  /**
   * Sets the value at the given index.
   * @param i - The index.
   * @param value - The value.
   * @returns The vector.
   */
  set(i: number, value: number): this {
    if (i < 0 || i >= this._size) {
      throw new RangeError("Index out of bounds");
    }
    this._data[i] = value;
    return this;
  }

  /**
   * Adds the other vector to the current vector.
   * @param other - The other vector.
   * @returns The added vector.
   */
  add(other: this | number): this {
    if (Vector.isVector(other)) {
      this.ensureSameSize(other);
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) + (other._data[i] as number);
      }
    } else {
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) + other;
      }
    }
    return this;
  }

  /**
   * Subtracts the other vector from the current vector.
   * @param other - The other vector.
   * @returns The subtracted vector.
   */
  sub(other: this | number): this {
    if (Vector.isVector(other)) {
      this.ensureSameSize(other);
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) - (other._data[i] as number);
      }
    } else {
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) - other;
      }
    }
    return this;
  }

  /**
   * Multiplies the current vector by the other vector.
   * @param other - The other vector.
   * @returns The multiplied vector.
   */
  mult(other: this | number): this {
    if (Vector.isVector(other)) {
      this.ensureSameSize(other);
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) * (other._data[i] as number);
      }
    } else {
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) * other;
      }
    }
    return this;
  }

  /**
   * Divides the current vector by the other vector.
   * @param other - The other vector.
   * @returns The divided vector.
   */
  div(other: this | number): this {
    if (Vector.isVector(other)) {
      this.ensureSameSize(other);
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) / (other._data[i] as number);
      }
    } else {
      for (let i = 0; i < this._size; i++) {
        this._data[i] = (this._data[i] as number) / other;
      }
    }
    return this;
  }

  /**
   * Scales the current vector by the given scalar.
   * @param scalar - The scalar.
   * @returns The scaled vector.
   */
  scale(scalar: number): this {
    for (let i = 0; i < this._size; i++) {
      this._data[i] = (this._data[i] as number) * scalar;
    }
    return this;
  }

  /**
   * Calculates the cross product of the current vector and the other vector.
   * @param other - The other vector.
   * @returns The cross product.
   */
  cross(other: this): this {
    this.ensureSameSize(other);
    for (let i = 0; i < this._size; i++) {
      this._data[i] = (this._data[i] as number) * (other._data[i] as number);
    }
    return this;
  }

  /**
   * Normalizes the current vector.
   * @returns The normalized vector.
   */
  normalize(): this {
    const len = this.length;
    if (len > 0) {
      this.scale(1 / len);
    } else {
      for (let i = 0; i < this._size; i++) {
        this._data[i] = 0;
      }
    }
    return this;
  }

  /**
   * Calculates the dot product of the current vector and the other vector.
   * @param other - The other vector.
   * @returns The dot product.
   */
  dot(other: this): number {
    this.ensureSameSize(other);
    let s = 0;
    for (let i = 0; i < this._size; i++) {
      s += (this._data[i] as number) * (other._data[i] as number);
    }
    return s;
  }

  /**
   * Checks if the current vector is equal to the other vector.
   * @param other - The other vector.
   * @returns True if the vectors are equal, false otherwise.
   */
  equals<TOtherArr extends NumberArray, TOtherSize extends number>(other: Vector<TOtherArr, TOtherSize>): boolean {
    if (this._size !== (other.size as unknown as TSize)) return false;
    for (let i = 0; i < this._size; i++) {
      if (this._data[i] !== other.data[i]) return false;
    }
    return true;
  }

  /**
   * Fills the matrix with the given value.
   * @param value - The value to fill the matrix with.
   * @returns The matrix.
   */
  fill(value: number): this {
    for (let i = 0; i < this._size; i++) {
      this._data[i] = value;
    }
    return this;
  }

  /**
   * Reverses the current vector.
   * @returns The reversed vector.
   */
  reverse(): this {
    for (let i = 0; i < this._size / 2; i++) {
      const temp = this._data[i]!;
      this._data[i] = this._data[this._size - i - 1]!;
      this._data[this._size - i - 1] = temp;
    }
    return this;
  }

  /**
   * Clone returns an owned clone (copy of data).
   * If you want a view on the same buffer, use fromBuffer/fromArrayView
   * in your concrete subclass.
   */
  clone(): Vector<TArr, TSize> {
    const ctor = this._data.constructor as unknown as NumberArrayConstructor;
    const copy = new ctor(this._size) as TArr;
    if (Array.isArray(copy)) {
      copy.splice(0, copy.length, ...this._data);
    } else {
      (copy as unknown as TypedArray).set(this._data as unknown as TypedArray);
    }
    return new Vector(copy, this._size);
  }

  /**
   * Returns a reversed copy of the current vector.
   * @returns The reversed vector.
   */
  toReversed(): Vector<TArr, TSize> {
    return this.clone().reverse();
  }

  /**
   * Returns a copy of the underlying storage as-is.
   * @param orientation - The orientation of the typed array.
   * @returns The typed array.
   */
  protected toTypedArray(constructor: TypedArrayConstructor): TypedArray {
    const out = new constructor(this._data.length) as TypedArray;
    out.set(this._data);
    return out;
  }

  /**
   * Returns a plain array copy.
   * @returns The array.
   */
  toArray(): number[] {
    return Array.from(this._data);
  }

  /**
   * Returns a copy of the underlying storage as a float32 array.
   * @returns The float32 array.
   */
  toFloat32Array(): Float32Array {
    return this.toTypedArray(Float32Array.prototype.constructor as unknown as TypedArrayConstructor) as Float32Array;
  }

  /**
   * Returns a copy of the underlying storage as a float64 array.
   * @returns The float64 array.
   */
  toFloat64Array(): Float64Array {
    return this.toTypedArray(Float64Array.prototype.constructor as unknown as TypedArrayConstructor) as Float64Array;
  }

  /**
   * Returns a copy of the underlying storage as a int8 array.
   * @returns The int8 array.
   */
  toInt8Array(): Int8Array {
    return this.toTypedArray(Int8Array.prototype.constructor as unknown as TypedArrayConstructor) as Int8Array;
  }

  /**
   * Returns a copy of the underlying storage as a int16 array.
   * @returns The int16 array.
   */
  toInt16Array(): Int16Array {
    return this.toTypedArray(Int16Array.prototype.constructor as unknown as TypedArrayConstructor) as Int16Array;
  }

  /**
   * Returns a copy of the underlying storage as a int32 array.
   * @returns The int32 array.
   */
  toInt32Array(): Int32Array {
    return this.toTypedArray(Int32Array.prototype.constructor as unknown as TypedArrayConstructor) as Int32Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint16 array.
   * @returns The uint16 array.
   */
  toUint16Array(): Uint16Array {
    return this.toTypedArray(Uint16Array.prototype.constructor as unknown as TypedArrayConstructor) as Uint16Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint8 array.
   * @returns The uint8 array.
   */
  toUint8Array(): Uint8Array {
    return this.toTypedArray(Uint8Array.prototype.constructor as unknown as TypedArrayConstructor) as Uint8Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint8 clamped array.
   * @returns The uint8 clamped array.
   */
  toUint8ClampedArray(): Uint8ClampedArray {
    return this.toTypedArray(Uint8ClampedArray.prototype.constructor as unknown as TypedArrayConstructor) as Uint8ClampedArray;
  }

  /**
   * Returns a copy of the underlying storage as a uint32 array.
   * @returns The uint32 array.
   */
  toUint32Array(): Uint32Array {
    return this.toTypedArray(Uint32Array.prototype.constructor as unknown as TypedArrayConstructor) as Uint32Array;
  }
}

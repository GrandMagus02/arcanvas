import { Float32Vector3, Float64Vector3, Int16Vector3, Int8Vector3, Uint16Vector3, Uint8Vector3, type TypedArray } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Matrix3x3 is a base class for all 3x3 matrices.
 * @param TArr - The typed array constructor.
 * @param TRowVec - The type of the row vectors.
 */
export abstract class Matrix3x3<TArr extends TypedArray, TRowVec> extends Matrix<TArr, 3, 3> {
  protected constructor(data: TArr) {
    super(data, 3, 3);
    if (data.length !== 9) {
      throw new Error("Matrix3x3 requires exactly 9 elements");
    }
  }

  // Common row/col element accessors for convenience
  get a11(): number {
    return this.get(0, 0);
  }
  set a11(v: number) {
    this.set(0, 0, v);
  }
  get a12(): number {
    return this.get(0, 1);
  }
  set a12(v: number) {
    this.set(0, 1, v);
  }
  get a13(): number {
    return this.get(0, 2);
  }
  set a13(v: number) {
    this.set(0, 2, v);
  }

  get a21(): number {
    return this.get(1, 0);
  }
  set a21(v: number) {
    this.set(1, 0, v);
  }
  get a22(): number {
    return this.get(1, 1);
  }
  set a22(v: number) {
    this.set(1, 1, v);
  }
  get a23(): number {
    return this.get(1, 2);
  }
  set a23(v: number) {
    this.set(1, 2, v);
  }

  get a31(): number {
    return this.get(2, 0);
  }
  set a31(v: number) {
    this.set(2, 0, v);
  }
  get a32(): number {
    return this.get(2, 1);
  }
  set a32(v: number) {
    this.set(2, 1, v);
  }
  get a33(): number {
    return this.get(2, 2);
  }
  set a33(v: number) {
    this.set(2, 2, v);
  }

  // Factory helpers that concrete classes must provide
  protected abstract createFromRows(r0c0: number, r0c1: number, r0c2: number, r1c0: number, r1c1: number, r1c2: number, r2c0: number, r2c1: number, r2c2: number): this;

  protected abstract isRowVector(v: unknown): v is TRowVec;
  protected abstract rowVecGet(v: TRowVec, i: 0 | 1 | 2): number;

  // Polymorphic static .from handling:
  // 1) nested arrays of numbers
  // 2) three row vectors (type-specific)
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix3x3<TArr, TRowVec>>(
    this: {
      new (a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): TSelf;
      prototype: Matrix3x3<TArr, TRowVec>;
    },
    rows: ArrayLike<ArrayLike<number>>
  ): TSelf;
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix3x3<TArr, TRowVec>>(
    this: {
      new (a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): TSelf;
      prototype: Matrix3x3<TArr, TRowVec>;
    },
    row0: TRowVec,
    row1: TRowVec,
    row2: TRowVec
  ): TSelf;
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix3x3<TArr, TRowVec>>(
    this: {
      new (a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): TSelf;
      prototype: Matrix3x3<TArr, TRowVec>;
    },
    ...args: unknown[]
  ): TSelf {
    if (args.length === 1) {
      const rows = args[0] as ArrayLike<ArrayLike<number>>;
      if (!rows || typeof rows !== "object" || typeof (rows as ArrayLike<unknown>).length !== "number") {
        throw new Error("Invalid input to Matrix3x3Base.from");
      }
      if (rows.length < 3) {
        throw new Error("Matrix3x3.from requires 3 rows");
      }
      const r0 = rows[0];
      const r1 = rows[1];
      const r2 = rows[2];
      if (!r0 || r0.length < 3 || !r1 || r1.length < 3 || !r2 || r2.length < 3) {
        throw new Error("Each row must have at least 3 elements");
      }
      return new this(r0[0]!, r0[1]!, r0[2]!, r1[0]!, r1[1]!, r1[2]!, r2[0]!, r2[1]!, r2[2]!);
    } else if (args.length === 3) {
      const selfProto = this.prototype;
      const r0 = args[0];
      const r1 = args[1];
      const r2 = args[2];
      if (selfProto.isRowVector(r0) && selfProto.isRowVector(r1) && selfProto.isRowVector(r2)) {
        const v0 = r0;
        const v1 = r1;
        const v2 = r2;
        return new this(
          selfProto.rowVecGet(v0, 0),
          selfProto.rowVecGet(v0, 1),
          selfProto.rowVecGet(v0, 2),
          selfProto.rowVecGet(v1, 0),
          selfProto.rowVecGet(v1, 1),
          selfProto.rowVecGet(v1, 2),
          selfProto.rowVecGet(v2, 0),
          selfProto.rowVecGet(v2, 1),
          selfProto.rowVecGet(v2, 2)
        );
      }
      throw new Error("Invalid input: expected three row vectors");
    }
    throw new Error("Invalid input to Matrix3x3Base.from");
  }

  static identity<TArr extends TypedArray, TRowVec, TSelf extends Matrix3x3<TArr, TRowVec>>(this: {
    new (a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): TSelf;
    prototype: Matrix3x3<TArr, TRowVec>;
  }): TSelf {
    return new this(1, 0, 0, 0, 1, 0, 0, 0, 1);
  }
}

/**
 * Uint8Matrix3x3 is a 3x3 matrix of unsigned 8-bit integers.
 */
export class Uint8Matrix3x3 extends Matrix3x3<Uint8Array, Uint8Vector3> {
  constructor(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number) {
    super(new Uint8Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]));
  }

  protected createFromRows(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): this {
    return new Uint8Matrix3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) as this;
  }

  protected isRowVector(v: unknown): v is Uint8Vector3 {
    return v instanceof Uint8Vector3;
  }

  protected rowVecGet(v: Uint8Vector3, i: 0 | 1 | 2): number {
    return i === 0 ? v.x : i === 1 ? v.y : v.z;
  }
}

/**
 * Int8Matrix3x3 is a 3x3 matrix of signed 8-bit integers.
 */
export class Int8Matrix3x3 extends Matrix3x3<Int8Array, Int8Vector3> {
  constructor(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number) {
    super(new Int8Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]));
  }

  protected createFromRows(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): this {
    return new Int8Matrix3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) as this;
  }

  protected isRowVector(v: unknown): v is Int8Vector3 {
    return v instanceof Int8Vector3;
  }

  protected rowVecGet(v: Int8Vector3, i: 0 | 1 | 2): number {
    return i === 0 ? v.x : i === 1 ? v.y : v.z;
  }
}

/**
 * Int16Matrix3x3 is a 3x3 matrix of signed 16-bit integers.
 */
export class Int16Matrix3x3 extends Matrix3x3<Int16Array, Int16Vector3> {
  constructor(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number) {
    super(new Int16Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]));
  }

  protected createFromRows(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): this {
    return new Int16Matrix3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) as this;
  }

  protected isRowVector(v: unknown): v is Int16Vector3 {
    return v instanceof Int16Vector3;
  }

  protected rowVecGet(v: Int16Vector3, i: 0 | 1 | 2): number {
    return i === 0 ? v.x : i === 1 ? v.y : v.z;
  }
}

/**
 * Uint16Matrix3x3 is a 3x3 matrix of unsigned 16-bit integers.
 */
export class Uint16Matrix3x3 extends Matrix3x3<Uint16Array, Uint16Vector3> {
  constructor(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number) {
    super(new Uint16Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]));
  }

  protected createFromRows(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): this {
    return new Uint16Matrix3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) as this;
  }

  protected isRowVector(v: unknown): v is Uint16Vector3 {
    return v instanceof Uint16Vector3;
  }

  protected rowVecGet(v: Uint16Vector3, i: 0 | 1 | 2): number {
    return i === 0 ? v.x : i === 1 ? v.y : v.z;
  }
}

/**
 * Float32Matrix3x3 is a 3x3 matrix of 32-bit floating point numbers.
 */
export class Float32Matrix3x3 extends Matrix3x3<Float32Array, Float32Vector3> {
  constructor(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number) {
    super(new Float32Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]));
  }

  protected createFromRows(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): this {
    return new Float32Matrix3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) as this;
  }

  protected isRowVector(v: unknown): v is Float32Vector3 {
    return v instanceof Float32Vector3;
  }

  protected rowVecGet(v: Float32Vector3, i: 0 | 1 | 2): number {
    return i === 0 ? v.x : i === 1 ? v.y : v.z;
  }
}

/**
 * Float64Matrix3x3 is a 3x3 matrix of 64-bit floating point numbers.
 */
export class Float64Matrix3x3 extends Matrix3x3<Float64Array, Float64Vector3> {
  constructor(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number) {
    super(new Float64Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]));
  }

  protected createFromRows(a11: number, a12: number, a13: number, a21: number, a22: number, a23: number, a31: number, a32: number, a33: number): this {
    return new Float64Matrix3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) as this;
  }

  protected isRowVector(v: unknown): v is Float64Vector3 {
    return v instanceof Float64Vector3;
  }

  protected rowVecGet(v: Float64Vector3, i: 0 | 1 | 2): number {
    return i === 0 ? v.x : i === 1 ? v.y : v.z;
  }
}

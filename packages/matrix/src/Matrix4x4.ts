import { Float32Vector4, Float64Vector4, Int16Vector4, Int8Vector4, Uint16Vector4, Uint8Vector4, type TypedArray } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Matrix4x4 is a base class for all 4x4 matrices.
 * @param TArr - The typed array constructor.
 * @param TRowVec - The type of the row vectors.
 */
export abstract class Matrix4x4<TArr extends TypedArray, TRowVec> extends Matrix<TArr, 4, 4> {
  protected constructor(data: TArr) {
    super(data, 4, 4);
    if (data.length !== 16) {
      throw new Error("Matrix4x4 requires exactly 16 elements");
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
  get a14(): number {
    return this.get(0, 3);
  }
  set a14(v: number) {
    this.set(0, 3, v);
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
  get a24(): number {
    return this.get(1, 3);
  }
  set a24(v: number) {
    this.set(1, 3, v);
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
  get a34(): number {
    return this.get(2, 3);
  }
  set a34(v: number) {
    this.set(2, 3, v);
  }

  get a41(): number {
    return this.get(3, 0);
  }
  set a41(v: number) {
    this.set(3, 0, v);
  }
  get a42(): number {
    return this.get(3, 1);
  }
  set a42(v: number) {
    this.set(3, 1, v);
  }
  get a43(): number {
    return this.get(3, 2);
  }
  set a43(v: number) {
    this.set(3, 2, v);
  }
  get a44(): number {
    return this.get(3, 3);
  }
  set a44(v: number) {
    this.set(3, 3, v);
  }

  // Factory helpers that concrete classes must provide
  protected abstract createFromRows(
    r0c0: number,
    r0c1: number,
    r0c2: number,
    r0c3: number,
    r1c0: number,
    r1c1: number,
    r1c2: number,
    r1c3: number,
    r2c0: number,
    r2c1: number,
    r2c2: number,
    r2c3: number,
    r3c0: number,
    r3c1: number,
    r3c2: number,
    r3c3: number
  ): this;

  protected abstract isRowVector(v: unknown): v is TRowVec;
  protected abstract rowVecGet(v: TRowVec, i: 0 | 1 | 2 | 3): number;

  // Polymorphic static .from handling:
  // 1) nested arrays of numbers
  // 2) three row vectors (type-specific)
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix4x4<TArr, TRowVec>>(
    this: {
      new (
        a11: number,
        a12: number,
        a13: number,
        a14: number,
        a21: number,
        a22: number,
        a23: number,
        a24: number,
        a31: number,
        a32: number,
        a33: number,
        a34: number,
        a41: number,
        a42: number,
        a43: number,
        a44: number
      ): TSelf;
      prototype: Matrix4x4<TArr, TRowVec>;
    },
    rows: ArrayLike<ArrayLike<number>>
  ): TSelf;
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix4x4<TArr, TRowVec>>(
    this: {
      new (
        a11: number,
        a12: number,
        a13: number,
        a14: number,
        a21: number,
        a22: number,
        a23: number,
        a24: number,
        a31: number,
        a32: number,
        a33: number,
        a34: number,
        a41: number,
        a42: number,
        a43: number,
        a44: number
      ): TSelf;
      prototype: Matrix4x4<TArr, TRowVec>;
    },
    row0: TRowVec,
    row1: TRowVec,
    row2: TRowVec
  ): TSelf;
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix4x4<TArr, TRowVec>>(
    this: {
      new (
        a11: number,
        a12: number,
        a13: number,
        a14: number,
        a21: number,
        a22: number,
        a23: number,
        a24: number,
        a31: number,
        a32: number,
        a33: number,
        a34: number,
        a41: number,
        a42: number,
        a43: number,
        a44: number
      ): TSelf;
      prototype: Matrix4x4<TArr, TRowVec>;
    },
    ...args: unknown[]
  ): TSelf {
    if (args.length === 1) {
      const rows = args[0] as ArrayLike<ArrayLike<number>>;
      if (!rows || typeof rows !== "object" || typeof (rows as ArrayLike<unknown>).length !== "number") {
        throw new Error("Invalid input to Matrix4x4Base.from");
      }
      if (rows.length < 4) {
        throw new Error("Matrix4x4.from requires 4 rows");
      }
      const r0 = rows[0];
      const r1 = rows[1];
      const r2 = rows[2];
      const r3 = rows[3];
      if (!r0 || r0.length < 4 || !r1 || r1.length < 4 || !r2 || r2.length < 4 || !r3 || r3.length < 4) {
        throw new Error("Each row must have at least 4 elements");
      }
      return new this(r0[0]!, r0[1]!, r0[2]!, r0[3]!, r1[0]!, r1[1]!, r1[2]!, r1[3]!, r2[0]!, r2[1]!, r2[2]!, r2[3]!, r3[0]!, r3[1]!, r3[2]!, r3[3]!);
    } else if (args.length === 3) {
      const selfProto = this.prototype;
      const r0 = args[0];
      const r1 = args[1];
      const r2 = args[2];
      const r3 = args[3];
      if (selfProto.isRowVector(r0) && selfProto.isRowVector(r1) && selfProto.isRowVector(r2) && selfProto.isRowVector(r3)) {
        const v0 = r0;
        const v1 = r1;
        const v2 = r2;
        const v3 = r3;
        return new this(
          selfProto.rowVecGet(v0, 0),
          selfProto.rowVecGet(v0, 1),
          selfProto.rowVecGet(v0, 2),
          selfProto.rowVecGet(v0, 3),
          selfProto.rowVecGet(v1, 0),
          selfProto.rowVecGet(v1, 1),
          selfProto.rowVecGet(v1, 2),
          selfProto.rowVecGet(v1, 3),
          selfProto.rowVecGet(v2, 0),
          selfProto.rowVecGet(v2, 1),
          selfProto.rowVecGet(v2, 2),
          selfProto.rowVecGet(v2, 3),
          selfProto.rowVecGet(v3, 0),
          selfProto.rowVecGet(v3, 1),
          selfProto.rowVecGet(v3, 2),
          selfProto.rowVecGet(v3, 3)
        );
      }
      throw new Error("Invalid input: expected three row vectors");
    }
    throw new Error("Invalid input to Matrix4x4Base.from");
  }

  static identity<TArr extends TypedArray, TRowVec, TSelf extends Matrix4x4<TArr, TRowVec>>(this: {
    new (
      a11: number,
      a12: number,
      a13: number,
      a14: number,
      a21: number,
      a22: number,
      a23: number,
      a24: number,
      a31: number,
      a32: number,
      a33: number,
      a34: number,
      a41: number,
      a42: number,
      a43: number,
      a44: number
    ): TSelf;
    prototype: Matrix4x4<TArr, TRowVec>;
  }): TSelf {
    return new this(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
}

/**
 * Uint8Matrix3x3 is a 3x3 matrix of unsigned 8-bit integers.
 */
export class Uint8Matrix4x4 extends Matrix4x4<Uint8Array, Uint8Vector4> {
  constructor(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ) {
    super(new Uint8Array([a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44]));
  }

  protected createFromRows(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ): this {
    return new Uint8Matrix4x4(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) as this;
  }

  protected isRowVector(v: unknown): v is Uint8Vector4 {
    return v instanceof Uint8Vector4;
  }

  protected rowVecGet(v: Uint8Vector4, i: 0 | 1 | 2 | 3): number {
    return i === 0 ? v.x : i === 1 ? v.y : i === 2 ? v.z : v.w;
  }
}

/**
 * Int8Matrix3x3 is a 3x3 matrix of signed 8-bit integers.
 */
export class Int8Matrix4x4 extends Matrix4x4<Int8Array, Int8Vector4> {
  constructor(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ) {
    super(new Int8Array([a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44]));
  }

  protected createFromRows(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ): this {
    return new Int8Matrix4x4(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) as this;
  }

  protected isRowVector(v: unknown): v is Int8Vector4 {
    return v instanceof Int8Vector4;
  }

  protected rowVecGet(v: Int8Vector4, i: 0 | 1 | 2 | 3): number {
    return i === 0 ? v.x : i === 1 ? v.y : i === 2 ? v.z : v.w;
  }
}

/**
 * Int16Matrix3x3 is a 3x3 matrix of signed 16-bit integers.
 */
export class Int16Matrix4x4 extends Matrix4x4<Int16Array, Int16Vector4> {
  constructor(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ) {
    super(new Int16Array([a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44]));
  }

  protected createFromRows(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ): this {
    return new Int16Matrix4x4(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) as this;
  }

  protected isRowVector(v: unknown): v is Int16Vector4 {
    return v instanceof Int16Vector4;
  }

  protected rowVecGet(v: Int16Vector4, i: 0 | 1 | 2 | 3): number {
    return i === 0 ? v.x : i === 1 ? v.y : i === 2 ? v.z : v.w;
  }
}

/**
 * Uint16Matrix3x3 is a 3x3 matrix of unsigned 16-bit integers.
 */
export class Uint16Matrix4x4 extends Matrix4x4<Uint16Array, Uint16Vector4> {
  constructor(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ) {
    super(new Uint16Array([a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44]));
  }

  protected createFromRows(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ): this {
    return new Uint16Matrix4x4(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) as this;
  }

  protected isRowVector(v: unknown): v is Uint16Vector4 {
    return v instanceof Uint16Vector4;
  }

  protected rowVecGet(v: Uint16Vector4, i: 0 | 1 | 2 | 3): number {
    return i === 0 ? v.x : i === 1 ? v.y : i === 2 ? v.z : v.w;
  }
}

/**
 * Float32Matrix3x3 is a 3x3 matrix of 32-bit floating point numbers.
 */
export class Float32Matrix4x4 extends Matrix4x4<Float32Array, Float32Vector4> {
  constructor(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ) {
    super(new Float32Array([a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44]));
  }

  protected createFromRows(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ): this {
    return new Float32Matrix4x4(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) as this;
  }

  protected isRowVector(v: unknown): v is Float32Vector4 {
    return v instanceof Float32Vector4;
  }

  protected rowVecGet(v: Float32Vector4, i: 0 | 1 | 2 | 3): number {
    return i === 0 ? v.x : i === 1 ? v.y : i === 2 ? v.z : v.w;
  }
}

/**
 * Float64Matrix3x3 is a 3x3 matrix of 64-bit floating point numbers.
 */
export class Float64Matrix4x4 extends Matrix4x4<Float64Array, Float64Vector4> {
  constructor(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ) {
    super(new Float64Array([a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44]));
  }

  protected createFromRows(
    a11: number,
    a12: number,
    a13: number,
    a14: number,
    a21: number,
    a22: number,
    a23: number,
    a24: number,
    a31: number,
    a32: number,
    a33: number,
    a34: number,
    a41: number,
    a42: number,
    a43: number,
    a44: number
  ): this {
    return new Float64Matrix4x4(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) as this;
  }

  protected isRowVector(v: unknown): v is Float64Vector4 {
    return v instanceof Float64Vector4;
  }

  protected rowVecGet(v: Float64Vector4, i: 0 | 1 | 2 | 3): number {
    return i === 0 ? v.x : i === 1 ? v.y : i === 2 ? v.z : v.w;
  }
}

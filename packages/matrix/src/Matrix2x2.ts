import { Float32Vector2, Float64Vector2, Int16Vector2, Int8Vector2, Uint16Vector2, Uint8Vector2, type TypedArray } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Matrix2x2 is a base class for all 2x2 matrices.
 * @param TArr - The typed array constructor.
 * @param TRowVec - The type of the row vectors.
 */
export abstract class Matrix2x2<TArr extends TypedArray, TRowVec> extends Matrix<TArr, 2, 2> {
  protected constructor(data: TArr) {
    super(data, 2, 2);
    if (data.length !== 4) {
      throw new Error("Matrix2x2 requires exactly 4 elements");
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

  // Factory helpers that concrete classes must provide
  protected abstract createFromRows(r0c0: number, r0c1: number, r1c0: number, r1c1: number): this;

  protected abstract isRowVector(v: unknown): v is TRowVec;
  protected abstract rowVecGet(v: TRowVec, i: 0 | 1): number;

  // Polymorphic static .from handling:
  // 1) nested arrays of numbers
  // 2) two row vectors (type-specific)
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix2x2<TArr, TRowVec>>(
    this: {
      new (a11: number, a12: number, a21: number, a22: number): TSelf;
      prototype: Matrix2x2<TArr, TRowVec>;
    },
    rows: ArrayLike<ArrayLike<number>>
  ): TSelf;
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix2x2<TArr, TRowVec>>(
    this: {
      new (a11: number, a12: number, a21: number, a22: number): TSelf;
      prototype: Matrix2x2<TArr, TRowVec>;
    },
    row1: TRowVec,
    row2: TRowVec
  ): TSelf;
  static from<TArr extends TypedArray, TRowVec, TSelf extends Matrix2x2<TArr, TRowVec>>(
    this: {
      new (a11: number, a12: number, a21: number, a22: number): TSelf;
      prototype: Matrix2x2<TArr, TRowVec>;
    },
    ...args: unknown[]
  ): TSelf {
    if (args.length === 1) {
      const rows = args[0] as ArrayLike<ArrayLike<number>>;
      if (!rows || typeof rows !== "object" || typeof (rows as ArrayLike<unknown>).length !== "number") {
        throw new Error("Invalid input to Matrix2x2Base.from");
      }
      if (rows.length < 2) {
        throw new Error("Matrix2x2.from requires 2 rows");
      }
      const r0 = rows[0];
      const r1 = rows[1];
      if (!r0 || r0.length < 2 || !r1 || r1.length < 2) {
        throw new Error("Each row must have at least 2 elements");
      }
      return new this(r0[0]!, r0[1]!, r1[0]!, r1[1]!);
    } else if (args.length === 2) {
      const selfProto = this.prototype;
      const r0 = args[0];
      const r1 = args[1];
      if (selfProto.isRowVector(r0) && selfProto.isRowVector(r1)) {
        const v0 = r0;
        const v1 = r1;
        return new this(selfProto.rowVecGet(v0, 0), selfProto.rowVecGet(v0, 1), selfProto.rowVecGet(v1, 0), selfProto.rowVecGet(v1, 1));
      }
      throw new Error("Invalid input: expected two row vectors");
    }
    throw new Error("Invalid input to Matrix2x2Base.from");
  }

  static identity<TArr extends TypedArray, TRowVec, TSelf extends Matrix2x2<TArr, TRowVec>>(this: {
    new (a11: number, a12: number, a21: number, a22: number): TSelf;
    prototype: Matrix2x2<TArr, TRowVec>;
  }): TSelf {
    return new this(1, 0, 0, 1);
  }
}

/**
 * Uint8Matrix2x2 is a 2x2 matrix of unsigned 8-bit integers.
 */
export class Uint8Matrix2x2 extends Matrix2x2<Uint8Array, Uint8Vector2> {
  constructor(a11: number, a12: number, a21: number, a22: number) {
    super(new Uint8Array([a11, a12, a21, a22]));
  }

  protected createFromRows(a11: number, a12: number, a21: number, a22: number): this {
    return new Uint8Matrix2x2(a11, a12, a21, a22) as this;
  }

  protected isRowVector(v: unknown): v is Uint8Vector2 {
    return v instanceof Uint8Vector2;
  }

  protected rowVecGet(v: Uint8Vector2, i: 0 | 1): number {
    return i === 0 ? v.x : v.y;
  }
}

/**
 * Int8Matrix2x2 is a 2x2 matrix of signed 8-bit integers.
 */
export class Int8Matrix2x2 extends Matrix2x2<Int8Array, Int8Vector2> {
  constructor(a11: number, a12: number, a21: number, a22: number) {
    super(new Int8Array([a11, a12, a21, a22]));
  }

  protected createFromRows(a11: number, a12: number, a21: number, a22: number): this {
    return new Int8Matrix2x2(a11, a12, a21, a22) as this;
  }

  protected isRowVector(v: unknown): v is Int8Vector2 {
    return v instanceof Int8Vector2;
  }

  protected rowVecGet(v: Int8Vector2, i: 0 | 1): number {
    return i === 0 ? v.x : v.y;
  }
}

/**
 * Int16Matrix2x2 is a 2x2 matrix of signed 16-bit integers.
 */
export class Int16Matrix2x2 extends Matrix2x2<Int16Array, Int16Vector2> {
  constructor(a11: number, a12: number, a21: number, a22: number) {
    super(new Int16Array([a11, a12, a21, a22]));
  }

  protected createFromRows(a11: number, a12: number, a21: number, a22: number): this {
    return new Int16Matrix2x2(a11, a12, a21, a22) as this;
  }

  protected isRowVector(v: unknown): v is Int16Vector2 {
    return v instanceof Int16Vector2;
  }

  protected rowVecGet(v: Int16Vector2, i: 0 | 1): number {
    return i === 0 ? v.x : v.y;
  }
}

/**
 * Uint16Matrix2x2 is a 2x2 matrix of unsigned 16-bit integers.
 */
export class Uint16Matrix2x2 extends Matrix2x2<Uint16Array, Uint16Vector2> {
  constructor(a11: number, a12: number, a21: number, a22: number) {
    super(new Uint16Array([a11, a12, a21, a22]));
  }

  protected createFromRows(a11: number, a12: number, a21: number, a22: number): this {
    return new Uint16Matrix2x2(a11, a12, a21, a22) as this;
  }

  protected isRowVector(v: unknown): v is Uint16Vector2 {
    return v instanceof Uint16Vector2;
  }

  protected rowVecGet(v: Uint16Vector2, i: 0 | 1): number {
    return i === 0 ? v.x : v.y;
  }
}

/**
 * Float32Matrix2x2 is a 2x2 matrix of 32-bit floating point numbers.
 */
export class Float32Matrix2x2 extends Matrix2x2<Float32Array, Float32Vector2> {
  constructor(a11: number, a12: number, a21: number, a22: number) {
    super(new Float32Array([a11, a12, a21, a22]));
  }

  protected createFromRows(a11: number, a12: number, a21: number, a22: number): this {
    return new Float32Matrix2x2(a11, a12, a21, a22) as this;
  }

  protected isRowVector(v: unknown): v is Float32Vector2 {
    return v instanceof Float32Vector2;
  }

  protected rowVecGet(v: Float32Vector2, i: 0 | 1): number {
    return i === 0 ? v.x : v.y;
  }
}

/**
 * Float64Matrix2x2 is a 2x2 matrix of 64-bit floating point numbers.
 */
export class Float64Matrix2x2 extends Matrix2x2<Float64Array, Float64Vector2> {
  constructor(a11: number, a12: number, a21: number, a22: number) {
    super(new Float64Array([a11, a12, a21, a22]));
  }

  protected createFromRows(a11: number, a12: number, a21: number, a22: number): this {
    return new Float64Matrix2x2(a11, a12, a21, a22) as this;
  }

  protected isRowVector(v: unknown): v is Float64Vector2 {
    return v instanceof Float64Vector2;
  }

  protected rowVecGet(v: Float64Vector2, i: 0 | 1): number {
    return i === 0 ? v.x : v.y;
  }
}

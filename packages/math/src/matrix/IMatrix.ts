import type { NumberArray } from "../vector/types";

/**
 * Read-only contract for matrix-like values (element access by column and row).
 * Used as the parameter type for binary operations so both Matrix and Vector can be accepted.
 */
export interface IMatrixLike {
  /** Value at column `c`, row `r` (row default 0). */
  get(c: number, r?: number, defaultValue?: number): number;
}

/**
 * Contract for mutable N×M matrices.
 * Data is stored in **column-major** order. Implemented by {@link Matrix} and its subclasses (e.g. Matrix2, Matrix3, Matrix4, Vector).
 */
export interface IMatrix extends IMatrixLike {
  /** Underlying storage (column-major). */
  readonly data: NumberArray;
  /** Total element count (rows × columns). */
  readonly size: number;
  /** Number of columns. */
  readonly cols: number;
  /** Number of columns (alias). */
  readonly columns: number;
  /** Number of rows. */
  readonly rows: number;

  /** Element at column `c`, row `r`. */
  get(c: number, r?: number, defaultValue?: number): number;
  /** Set element at column `c`, row `r`. Returns this for chaining. */
  set(c: number, r: number, value: number): this;

  /** Iterate over each element (column-major order). */
  forEach(callback: (value: number, c: number, r: number) => void): void;
  /** Map each element in place. Returns this for chaining. */
  map(callback: (value: number, c: number, r: number) => number): this;
  /** Reduce to a single value. */
  reduce(callback: (accumulator: number, value: number, c: number, r: number) => number, initialValue: number): number;
  /** True if predicate holds for every element. */
  every(callback: (value: number, c: number, r: number) => boolean): boolean;
  /** True if predicate holds for at least one element. */
  some(callback: (value: number, c: number, r: number) => boolean): boolean;
  /** First element satisfying the predicate, or undefined. */
  find(callback: (value: number, c: number, r: number) => boolean): number | undefined;
  /** First [column, row] satisfying the predicate, or undefined. */
  findIndex(callback: (value: number, c: number, r: number) => boolean): [number, number] | undefined;

  /** Fill all elements with `value` in place. Returns this for chaining. */
  fill(value: number): this;

  /** Matrix/vector multiply. Result dimensions depend on `other`. */
  mult(other: IMatrixLike): IMatrix;
  /** Element-wise add (returns new matrix). */
  add(other: IMatrixLike): IMatrix;
  /** Element-wise subtract (returns new matrix). */
  sub(other: IMatrixLike): IMatrix;
  /** Element-wise divide (returns new matrix). */
  div(other: IMatrixLike): IMatrix;

  /** Element-wise add in place. Returns this for chaining. */
  addSelf(other: IMatrixLike): this;
  /** Element-wise subtract in place. Returns this for chaining. */
  subSelf(other: IMatrixLike): this;
  /** Scale all elements by `scalar` in place. Returns this for chaining. */
  scaleSelf(scalar: number): this;

  /** Dot product (element-wise multiply and sum). */
  dot(other: IMatrixLike): number;
  /** True if every element equals the corresponding element of `other`. */
  equals(other: IMatrixLike): boolean;

  /** New instance with the same dimensions and data. */
  clone(): IMatrix;
  /** New matrix with rows and columns swapped. */
  transpose(): IMatrix;

  /** Copy as a plain number array (column-major). */
  toArray(): number[];
  /** Copy as Float32Array (column-major). */
  toFloat32Array(): Float32Array;
  /** Copy as Float64Array (column-major). */
  toFloat64Array(): Float64Array;
  toInt8Array(): Int8Array;
  toInt16Array(): Int16Array;
  toInt32Array(): Int32Array;
  toUint8Array(): Uint8Array;
  toUint8ClampedArray(): Uint8ClampedArray;
  toUint16Array(): Uint16Array;
  toUint32Array(): Uint32Array;
}

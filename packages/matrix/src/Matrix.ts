import { type NumberArray, type NumberArrayConstructor, type TypedArray, type TypedArrayConstructor, type Vector } from "@arcanvas/vector";
import { MatrixOrientation } from "./MatrixOrientation";

/**
 * BaseMatrix is a base class for all matrices.
 * @param TArr - The typed array constructor.
 * @param data - The data of the matrix.
 * @param rows - The number of rows in the matrix.
 * @param cols - The number of columns in the matrix.
 * @param initiallyRowMajor - Whether the matrix is initially row-major.
 */
export class Matrix<TArr extends NumberArray, TRows extends number, TCols extends number = TRows> {
  /**
   * The data of the matrix.
   */
  protected readonly _data: TArr;
  /**
   * The number of rows in the matrix.
   */
  protected _rows: TRows;
  /**
   * The number of columns in the matrix.
   */
  protected _cols: TCols;

  /**
   * Creates a new Matrix.
   * @param data - The data of the matrix.
   * @param rows - The number of rows in the matrix.
   * @param cols - The number of columns in the matrix.
   */
  constructor(data: TArr, rows: TRows, cols?: TCols) {
    if (rows <= 0 || (cols !== undefined && cols <= 0)) {
      throw new RangeError("Matrix dimensions must be positive");
    }
    this._rows = rows;
    this._cols = cols ?? (rows as unknown as TCols);
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
   * Validates the data of the matrix.
   * @param data - The data of the matrix.
   */
  protected validateData(data: TArr): TArr {
    const newData = new (data.constructor as unknown as NumberArrayConstructor)(data.length) as TArr;
    if (Array.isArray(newData)) {
      newData.splice(0, newData.length, ...data);
    } else {
      (newData as unknown as TypedArray).set(data as unknown as TypedArray);
    }
    for (let i = 0; i < this.size; i++) {
      newData[i] = this.validateValue(data[i]!);
    }
    return newData;
  }

  /**
   * Checks if the given row and column are within the bounds of the matrix.
   * @param r - The row.
   * @param c - The column.
   * @throws {RangeError} If the row or column is out of bounds.
   */
  protected checkBounds(r: number, c: number): void {
    if (r < 0 || r >= this._rows || c < 0 || c >= this._cols) {
      throw new RangeError("Matrix index out of bounds");
    }
  }

  /**
   * Returns a copy of the underlying storage as-is (in current major order).
   * @param orientation - The orientation of the typed array.
   * @returns The typed array.
   */
  protected toTypedArray(constructor: TypedArrayConstructor, orientation: MatrixOrientation = MatrixOrientation.RowMajor): TypedArray {
    const out = new constructor(this._data.length) as TypedArray;
    out.set(this._data);
    if (orientation === MatrixOrientation.ColumnMajor) {
      return this.transpose().toTypedArray(constructor, orientation);
    }
    return out;
  }

  /**
   * Returns the data of the matrix.
   * @returns The data of the matrix.
   */
  get data(): TArr {
    return this._data;
  }

  /**
   * Returns the size of the matrix.
   * @returns The size of the matrix.
   */
  get size(): number {
    return this._rows * this._cols;
  }

  /**
   * Returns the number of columns in the matrix.
   * @returns The number of columns in the matrix.
   */
  get cols(): TCols {
    return this._cols;
  }

  /**
   * Returns the number of columns in the matrix.
   * @returns The number of columns in the matrix.
   */
  get columns(): TCols {
    return this._cols;
  }

  /**
   * Returns the number of rows in the matrix.
   * @returns The number of rows in the matrix.
   */
  get rows(): TRows {
    return this._rows;
  }

  /**
   * Creates a matrix from an array.
   * @param array - The array.
   * @param rows - The number of rows.
   * @param cols - The number of columns.
   * @returns The new matrix.
   */
  static fromArray<TNewArr extends NumberArray, TNewRows extends number, TNewCols extends number>(array: ArrayLike<number>, rows: TNewRows, cols: TNewCols): Matrix<TNewArr, TNewRows, TNewCols> {
    const ctor = array.constructor as unknown as NumberArrayConstructor;
    const data = new ctor(rows * cols) as TNewArr;
    if (Array.isArray(data)) {
      data.splice(0, data.length, ...Array.from(array));
    } else {
      (data as unknown as TypedArray).set(array as unknown as TypedArray);
    }
    return new Matrix<TNewArr, TNewRows, TNewCols>(data, rows, cols);
  }

  /**
   * Creates a matrix from a vector.
   * @param vector - The vector.
   * @returns The new matrix.
   */
  static fromVector<TVecArr extends NumberArray, TVecSize extends number>(vector: Vector<TVecArr, TVecSize>): Matrix<TVecArr, TVecSize, 1> {
    const data = new (vector.data.constructor as unknown as NumberArrayConstructor)(vector.data.length) as TVecArr;
    if (Array.isArray(data)) {
      data.splice(0, data.length, ...vector.data);
    } else {
      (data as unknown as TypedArray).set(vector.data as unknown as TypedArray);
    }
    return new Matrix<TVecArr, TVecSize, 1>(data, vector.size, 1);
  }

  /**
   * Creates a matrix from another matrix.
   * @param matrix - The matrix.
   * @returns The new matrix.
   */
  static fromMatrix<TArr extends NumberArray, TRows extends number, TCols extends number, TSelf extends Matrix<TArr, TRows, TCols>>(
    this: { new (data: TArr, rows: TRows, cols: TCols): TSelf },
    matrix: Matrix<TArr, TRows, TCols>
  ): TSelf {
    const ctor = matrix._data.constructor as unknown as NumberArrayConstructor;
    const data = new ctor(matrix._rows * matrix._cols) as TArr;
    if (Array.isArray(data)) {
      data.splice(0, data.length, ...matrix._data);
    } else {
      (data as unknown as TypedArray).set(matrix._data as unknown as TypedArray);
    }
    return new this(data, matrix._rows, matrix._cols);
  }

  /**
   * Check if a value is a Matrix.
   * @param value - The value to check.
   * @returns True if the value is a Matrix.
   */
  static isMatrix(value: unknown): value is Matrix<NumberArray, number, number> {
    return value instanceof Matrix && typeof value.rows === "number" && typeof value.cols === "number";
  }

  /**
   * Returns the value of the matrix at the given row and column.
   * @param r - The row.
   * @param c - The column.
   * @returns The value.
   */
  get(r: number, c: number): number {
    this.checkBounds(r, c);
    const idx = r * this._cols + c;
    return this._data[idx]!;
  }

  /**
   * Sets the value of the matrix at the given row and column.
   * @param r - The row.
   * @param c - The column.
   * @param value - The value to set.
   * @returns The matrix.
   */
  set(r: number, c: number, value: number): this {
    this.checkBounds(r, c);
    const idx = r * this._cols + c;
    this._data[idx] = this.validateValue(value);
    return this;
  }

  /**
   * Iterates over the matrix.
   * @param callback - The callback function.
   */
  forEach(callback: (value: number, r: number, c: number) => void): void {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        callback(this.get(r, c), r, c);
      }
    }
  }

  /**
   * Maps the matrix to a new matrix.
   * @param callback - The callback function.
   * @returns The mapped matrix.
   */
  map(callback: (value: number, r: number, c: number) => number): Matrix<TArr, TRows, TCols> {
    const ctor = this._data.constructor as unknown as NumberArrayConstructor;
    const newData = new ctor(this._rows * this._cols) as TArr;
    const result = new (this.constructor as new (data: TArr, rows: TRows, cols: TCols) => Matrix<TArr, TRows, TCols>)(newData, this._rows, this._cols);
    this.forEach((value, r, c) => result.set(r, c, callback(value, r, c)));
    return result;
  }

  /**
   * Reduces the matrix to a single value.
   * @param callback - The callback function.
   * @param initialValue - The initial value.
   * @returns The reduced value.
   */
  reduce(callback: (accumulator: number, value: number, r: number, c: number) => number, initialValue: number): number {
    let accumulator = initialValue;
    this.forEach((value, r, c) => (accumulator = callback(accumulator, value, r, c)));
    return accumulator;
  }

  /**
   * Returns true if all elements satisfy the callback function.
   * @param callback - The callback function.
   * @returns True if all elements satisfy the callback function.
   */
  every(callback: (value: number, r: number, c: number) => boolean): boolean {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (!callback(this.get(r, c), r, c)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Returns true if at least one element satisfies the callback function.
   * @param callback - The callback function.
   * @returns True if at least one element satisfies the callback function.
   */
  some(callback: (value: number, r: number, c: number) => boolean): boolean {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (callback(this.get(r, c), r, c)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Finds the first element that satisfies the callback function.
   * @param callback - The callback function.
   * @returns The first element that satisfies the callback function.
   */
  find(callback: (value: number, r: number, c: number) => boolean): number | undefined {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (callback(this.get(r, c), r, c)) {
          return this.get(r, c);
        }
      }
    }
    return undefined;
  }

  /**
   * Finds the index of the first element that satisfies the callback function.
   * @param callback - The callback function.
   * @returns The index of the first element that satisfies the callback function.
   */
  findIndex(callback: (value: number, r: number, c: number) => boolean): [number, number] | undefined {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (callback(this.get(r, c), r, c)) {
          return [r, c];
        }
      }
    }
    return undefined;
  }

  /**
   * Fills the matrix with the given value.
   * @param value - The value to fill the matrix with.
   * @returns The matrix.
   */
  fill(value: number): this {
    for (let i = 0; i < this._rows * this._cols; i++) {
      this._data[i] = value;
    }
    return this;
  }

  /**
   * Returns a copy of the matrix multiplied by the other matrix.
   * @param other - The other matrix.
   * @returns The multiplied matrix.
   */
  mult<TOtherRows extends number, TOtherCols extends number>(other: Matrix<NumberArray, TOtherRows, TOtherCols> | Vector<NumberArray, TOtherCols>): Matrix<TArr, TRows, TOtherCols> {
    const otherMat = other instanceof Matrix ? other : Matrix.fromVector(other).transpose();
    if (this._cols !== otherMat.rows && this._rows !== (otherMat.columns as number)) {
      throw new Error("Matrix dimensions do not match");
    }
    const data: TArr = new (this._data.constructor as unknown as NumberArrayConstructor)(this._rows * otherMat.columns) as TArr;
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < otherMat.columns; c++) {
        let sum = 0;
        for (let k = 0; k < this._cols; k++) {
          sum += this.get(r, k) * other.get(k, c);
        }
        data[r * otherMat.columns + c] = sum;
      }
    }
    return new Matrix<TArr, TRows, TOtherCols>(data, this._rows, otherMat.columns);
  }

  /**
   * Returns a copy of the matrix added by the other matrix.
   * @param other - The other matrix.
   * @returns The added matrix.
   */
  add(other: Matrix<NumberArray, TRows, TCols>): Matrix<TArr, TRows, TCols> {
    return this.map((value, r, c) => value + other.get(r, c));
  }

  /**
   * Returns a copy of the matrix subtracted by the other matrix.
   * @param other - The other matrix.
   * @returns The subtracted matrix.
   */
  sub(other: Matrix<NumberArray, TRows, TCols>): Matrix<TArr, TRows, TCols> {
    return this.map((value, r, c) => value - other.get(r, c));
  }

  /**
   * Returns a copy of the matrix divided by the other matrix.
   * @param other - The other matrix.
   * @returns The divided matrix.
   */
  div(other: Matrix<NumberArray, TRows, TCols>): Matrix<TArr, TRows, TCols> {
    return this.map((value, r, c) => value / other.get(r, c));
  }

  /**
   * Returns the dot product of the matrix and the other matrix.
   * @param other - The other matrix.
   * @returns The dot product.
   */
  dot(other: Matrix<NumberArray, TRows, TCols> | Vector<NumberArray, TCols>): number {
    const otherMat = other instanceof Matrix ? other : Matrix.fromVector(other).transpose();
    return this.reduce((accumulator, value, r, c) => accumulator + value * otherMat.get(r, c), 0);
  }

  /**
   * Returns true if the matrix is equal to the other matrix.
   * @param other - The other matrix.
   * @returns True if the matrix is equal to the other matrix.
   */
  equals(other: Matrix<NumberArray, TRows, TCols> | Vector<NumberArray, TCols>): boolean {
    const otherMat = other instanceof Matrix ? other : Matrix.fromVector(other).transpose();
    return this.every((value, r, c) => value === otherMat.get(r, c));
  }

  /**
   * Returns a copy of the matrix.
   * @returns The copy.
   */
  clone(): Matrix<TArr, TRows, TCols> {
    const ctor = this._data.constructor as unknown as NumberArrayConstructor;
    const newData = new ctor(this._data.length) as TArr;
    if (Array.isArray(newData)) {
      newData.splice(0, newData.length, ...this._data);
    } else {
      (newData as unknown as TypedArray).set(this._data as unknown as TypedArray);
    }
    return new (this.constructor as new (data: TArr, rows: TRows, cols: TCols) => Matrix<TArr, TRows, TCols>)(newData, this._rows, this._cols);
  }

  /**
   * Transposes the matrix.
   * @returns The transposed matrix.
   */
  transpose(): Matrix<TArr, TCols, TRows> {
    const out = new (this._data.constructor as unknown as NumberArrayConstructor)(this._rows * this._cols) as TArr;
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        out[c * this._rows + r] = this._data[r * this._cols + c]! as TArr[number];
      }
    }
    return new Matrix<TArr, TCols, TRows>(out, this._cols, this._rows);
  }

  /**
   * Returns a copy of the matrix as an array.
   * @param orientation - The orientation of the array.
   * @returns The array.
   */
  toArray(orientation: MatrixOrientation = MatrixOrientation.RowMajor): number[] {
    if (orientation === MatrixOrientation.ColumnMajor) {
      return this.transpose().toArray();
    }
    return Array.from(this._data);
  }

  /**
   * Returns a copy of the underlying storage as a float32 array.
   * @param orientation - The orientation of the array.
   * @returns The float32 array.
   */
  toFloat32Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Float32Array {
    return this.toTypedArray(Float32Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Float32Array;
  }

  /**
   * Returns a copy of the underlying storage as a float64 array.
   * @param orientation - The orientation of the array.
   * @returns The float64 array.
   */
  toFloat64Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Float64Array {
    return this.toTypedArray(Float64Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Float64Array;
  }

  /**
   * Returns a copy of the underlying storage as a int8 array.
   * @param orientation - The orientation of the array.
   * @returns The int8 array.
   */
  toInt8Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Int8Array {
    return this.toTypedArray(Int8Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Int8Array;
  }

  /**
   * Returns a copy of the underlying storage as a int16 array.
   * @param orientation - The orientation of the array.
   * @returns The int16 array.
   */
  toInt16Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Int16Array {
    return this.toTypedArray(Int16Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Int16Array;
  }

  /**
   * Returns a copy of the underlying storage as a int32 array.
   * @param orientation - The orientation of the array.
   * @returns The int32 array.
   */
  toInt32Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Int32Array {
    return this.toTypedArray(Int32Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Int32Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint16 array.
   * @param orientation - The orientation of the array.
   * @returns The uint16 array.
   */
  toUint16Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Uint16Array {
    return this.toTypedArray(Uint16Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Uint16Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint8 array.
   * @param orientation - The orientation of the array.
   * @returns The uint8 array.
   */
  toUint8Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Uint8Array {
    return this.toTypedArray(Uint8Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Uint8Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint8 clamped array.
   * @param orientation - The orientation of the array.
   * @returns The uint8 clamped array.
   */
  toUint8ClampedArray(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Uint8ClampedArray {
    return this.toTypedArray(Uint8ClampedArray.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Uint8ClampedArray;
  }

  /**
   * Returns a copy of the underlying storage as a uint32 array.
   * @param orientation - The orientation of the array.
   * @returns The uint32 array.
   */
  toUint32Array(orientation: MatrixOrientation = MatrixOrientation.RowMajor): Uint32Array {
    return this.toTypedArray(Uint32Array.prototype.constructor as unknown as TypedArrayConstructor, orientation) as Uint32Array;
  }
}

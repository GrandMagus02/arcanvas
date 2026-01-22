import { Vector } from "../vector/Vector";
import type { NumberArray, NumberArrayConstructor, TypedArray, TypedArrayConstructor } from "../vector/types";

/**
 * Interface for the static side of Matrix classes, requiring identity method.
 */
export interface MatrixConstructor<TArr extends NumberArray, TRows extends number, TCols extends number = TRows> {
  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  identity(): Matrix<TArr, TRows, TCols>;

  new (data: TArr, rows: TRows, cols: TCols): Matrix<TArr, TRows, TCols>;
}

/**
 * BaseMatrix is a base class for all matrices.
 * Data is stored in **column-major** order for WebGL compatibility.
 * @param TArr - The typed array constructor.
 * @param data - The data of the matrix (column-major).
 * @param rows - The number of rows in the matrix.
 * @param cols - The number of columns in the matrix.
 * - Subclasses must implement static method: identity.
 * - Subclasses may implement static methods: of, fromArray, fromVector, fromMatrix.
 */
export class Matrix<TArr extends NumberArray, TCols extends number, TRows extends number = TCols> {
  /**
   * The data of the matrix in column-major order.
   */
  protected readonly _data: TArr;
  /**
   * The number of columns in the matrix.
   */
  protected _cols: TCols;
  /**
   * The number of rows in the matrix.
   */
  protected _rows: TRows;

  /**
   * Creates a new Matrix.
   * @param data - The data of the matrix (column-major order).
   * @param rows - The number of rows in the matrix.
   * @param cols - The number of columns in the matrix.
   */
  constructor(data: TArr, cols: TCols, rows?: TRows) {
    if (cols <= 0 || (rows !== undefined && rows <= 0)) {
      throw new RangeError("Matrix dimensions must be positive");
    }
    this._cols = cols;
    this._rows = rows ?? (cols as unknown as TRows);
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
    const newData = new (data.constructor as unknown as NumberArrayConstructor)(this.size) as TArr;
    if (Array.isArray(newData)) {
      newData.splice(0, newData.length, ...data);
    } else {
      newData.fill(0);
      (newData as unknown as TypedArray).set(data as unknown as TypedArray);
    }
    for (let i = 0; i < this.size; i++) {
      newData[i] = data[i]!;
    }
    return newData;
  }

  /**
   * Computes the column-major index for the given row and column.
   * @param c - The column.
   * @param r - The row.
   * @returns The index in the data array.
   */
  protected index(c: number, r: number): number {
    return c * this._rows + r;
  }

  /**
   * Checks if the given row and column are within the bounds of the matrix.
   * @param c - The column.
   * @param r - The row.
   * @throws {RangeError} If the row or column is out of bounds.
   */
  protected checkBounds(c: number, r: number): void {
    if (c < 0 || c >= this._cols || r < 0 || r >= this._rows) {
      throw new RangeError("Matrix index out of bounds");
    }
  }

  /**
   * Returns a copy of the underlying storage (in current column-major order)
   * or transposed to row-major if requested.
   * @param constructor - The typed array constructor.
   * @param orientation - The orientation of the typed array.
   * @returns The typed array.
   */
  protected toTypedArray(constructor: TypedArrayConstructor): TypedArray {
    if (this._data.constructor === constructor) {
      return this._data;
    }
    const out = new constructor(this._data.length) as TypedArray;
    out.set(this._data);
    return out;
  }

  /**
   * Returns the data of the matrix (column-major order).
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
  get(c: number, r: number = 0, defaultValue: number = 0): number {
    return this._data[c * this._rows + r] ?? defaultValue;
  }

  /**
   * Sets the value of the matrix at the given row and column.
   * @param c - The column.
   * @param r - The row.
   * @param value - The value to set.
   * @returns The matrix.
   */
  set(c: number, r: number, value: number): this {
    this._data[c * this._rows + r] = value;
    return this;
  }

  /**
   * Iterates over the matrix (logically row by row).
   * @param callback - The callback function.
   */
  forEach(callback: (value: number, c: number, r: number) => void): void {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        callback(this._data[c * this._rows + r]!, c, r);
      }
    }
  }

  /**
   * Maps the matrix to a new matrix.
   * @param callback - The callback function.
   * @returns The mapped matrix.
   */
  map(callback: (value: number, c: number, r: number) => number): this {
    const snapshot = this._data.slice();
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        this._data[c * this._rows + r] = callback(snapshot[c * this._rows + r]!, c, r);
      }
    }
    return this;
  }

  /**
   * Reduces the matrix to a single value.
   * @param callback - The callback function.
   * @param initialValue - The initial value.
   * @returns The reduced value.
   */
  reduce(callback: (accumulator: number, value: number, c: number, r: number) => number, initialValue: number): number {
    let accumulator = initialValue;
    this.forEach((value, c, r) => (accumulator = callback(accumulator, value, c, r)));
    return accumulator;
  }

  /**
   * Returns true if all elements satisfy the callback function.
   * @param callback - The callback function.
   * @returns True if all elements satisfy the callback function.
   */
  every(callback: (value: number, c: number, r: number) => boolean): boolean {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        if (!callback(this._data[c * this._rows + r]!, c, r)) {
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
  some(callback: (value: number, c: number, r: number) => boolean): boolean {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        if (callback(this._data[c * this._rows + r]!, c, r)) {
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
  find(callback: (value: number, c: number, r: number) => boolean): number | undefined {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        const idx = c * this._rows + r;
        if (callback(this._data[idx]!, c, r)) {
          return this._data[idx]!;
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
  findIndex(callback: (value: number, c: number, r: number) => boolean): [number, number] | undefined {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        if (callback(this._data[c * this._rows + r]!, c, r)) {
          return [c, r];
        }
      }
    }
    return undefined;
  }

  /**
   * Fills the matrix with the given value (in-place mutation).
   * Mutates this matrix and returns it for method chaining.
   * @param value - The value to fill the matrix with.
   * @returns This matrix after filling (for chaining).
   */
  fill(value: number): this {
    for (let i = 0; i < this._rows * this._cols; i++) {
      this._data[i] = value;
    }
    return this;
  }

  /**
   * Returns a copy of the matrix multiplied by the vector.
   * The vector size must match the matrix column count. Result is a vector of size equal to the matrix row count.
   * @param other - The vector to multiply.
   * @returns The resulting vector.
   */
  mult(other: Vector<NumberArray, TCols>): Vector<TArr, TRows>;
  /**
   * Returns a copy of the matrix multiplied by the other matrix.
   * @param other - The other matrix (its row count must match this matrix's column count).
   * @returns The multiplied matrix.
   */
  mult<TOtherCols extends number>(other: Matrix<NumberArray, TOtherCols, TCols>): Matrix<TArr, TOtherCols, TRows>;
  mult<TOtherCols extends number>(other: Matrix<NumberArray, TOtherCols, TCols> | Vector<NumberArray, TCols>): Matrix<TArr, TOtherCols, TRows> | Vector<TArr, TRows> {
    // Vector extends Matrix but is stored as row vector (1×n); convert to column vector (n×1) for multiply
    const otherMat: Matrix<NumberArray, number, number> = other instanceof Vector ? Matrix.fromVector(other).transpose() : other;
    if (this._cols !== otherMat.rows) {
      throw new Error("Matrix dimensions do not match");
    }
    const outCols = otherMat.columns;
    const data: TArr = new (this._data.constructor as unknown as NumberArrayConstructor)(this._rows * outCols) as TArr;
    // C[i][j] = sum_k A[i][k] * B[k][j]; column-major: C[i][j] at index j*rows+i
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < outCols; j++) {
        let sum = 0;
        for (let k = 0; k < this._cols; k++) {
          sum += this._data[k * this._rows + i]! * otherMat.get(j, k);
        }
        data[j * this._rows + i] = sum as TArr[number];
      }
    }
    return other instanceof Vector ? new Vector(data, this._rows) : new Matrix<TArr, TOtherCols, TRows>(data, outCols as TOtherCols, this._rows);
  }

  /**
   * Returns a copy of the matrix added by the other matrix (non-mutating).
   * Creates a new matrix instance without modifying this one.
   * @param other - The other matrix.
   * @returns A new matrix with the result of addition.
   */
  add(other: Matrix<NumberArray, TRows, TCols> | Vector<NumberArray, TCols>) {
    return this.map((value, c, r) => value + other.get(c, r));
  }

  /**
   * Returns a copy of the matrix subtracted by the other matrix (non-mutating).
   * Creates a new matrix instance without modifying this one.
   * @param other - The other matrix.
   * @returns A new matrix with the result of subtraction.
   */
  sub(other: Matrix<NumberArray, TRows, TCols>) {
    return this.map((value, c, r) => value - other.get(c, r));
  }

  /**
   * Returns a copy of the matrix divided by the other matrix (non-mutating).
   * Creates a new matrix instance without modifying this one.
   * @param other - The other matrix.
   * @returns A new matrix with the result of division.
   */
  div(other: Matrix<NumberArray, TRows, TCols>) {
    return this.map((value, c, r) => value / other.get(c, r));
  }

  /**
   * Adds the other matrix to this matrix (in-place mutation).
   * Mutates this matrix and returns it for method chaining.
   * @param other - The other matrix.
   * @returns This matrix after addition (for chaining).
   */
  addSelf(other: Matrix<NumberArray, TRows, TCols>): this {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        const idx = c * this._rows + r;
        this._data[idx] = (this._data[idx] as number) + other.get(c, r);
      }
    }
    return this;
  }

  /**
   * Subtracts the other matrix from this matrix (in-place mutation).
   * Mutates this matrix and returns it for method chaining.
   * @param other - The other matrix.
   * @returns This matrix after subtraction (for chaining).
   */
  subSelf(other: Matrix<NumberArray, TRows, TCols>): this {
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        const idx = c * this._rows + r;
        this._data[idx] = (this._data[idx] as number) - other.get(c, r);
      }
    }
    return this;
  }

  /**
   * Multiplies this matrix by a scalar (in-place mutation).
   * Mutates this matrix and returns it for method chaining.
   * @param scalar - The scalar value.
   * @returns This matrix after scaling (for chaining).
   */
  scaleSelf(scalar: number): this {
    for (let i = 0; i < this._rows * this._cols; i++) {
      this._data[i] = (this._data[i] as number) * scalar;
    }
    return this;
  }

  /**
   * Returns the dot product of the matrix and the other matrix.
   * @param other - The other matrix.
   * @returns The dot product.
   */
  dot(other: Matrix<NumberArray, TRows, TCols> | Vector<NumberArray, TCols>): number {
    return this.reduce((accumulator, value, c, r) => accumulator + value * other.get(c, r), 0);
  }

  /**
   * Returns true if the matrix is equal to the other matrix.
   * @param other - The other matrix.
   * @returns True if the matrix is equal to the other matrix.
   */
  equals(other: Matrix<NumberArray, TRows, TCols> | Vector<NumberArray, TCols>): boolean {
    return this.every((value, c, r) => value === other.get(c, r));
  }

  /**
   * Returns a copy of the matrix of the same type as this matrix.
   * @returns A new matrix instance of the same class with copied data.
   */
  clone(): this {
    const ctor = this.constructor as new (data: TArr, rows: TRows, cols?: TCols) => this;
    const bufCtor = this._data.constructor as unknown as NumberArrayConstructor;
    const newData = new bufCtor(this._data.length) as TArr;
    if (Array.isArray(newData)) {
      newData.splice(0, newData.length, ...this._data);
    } else {
      (newData as unknown as TypedArray).set(this._data as unknown as TypedArray);
    }
    return new ctor(newData, this._rows, this._cols);
  }

  /**
   * Returns a transposed copy of the matrix (non-mutating).
   * Creates a new matrix instance without modifying this one.
   * @returns A new transposed matrix.
   */
  transpose(): Matrix<TArr, TRows, TCols> {
    const out = new (this._data.constructor as unknown as NumberArrayConstructor)(this._rows * this._cols) as TArr;
    // Transpose: swap rows and cols, output in column-major
    for (let c = 0; c < this._cols; c++) {
      for (let r = 0; r < this._rows; r++) {
        // Original element at (r, c) goes to (c, r) in transposed matrix
        // In column-major: new index = r * newRows + c = r * cols + c
        out[r * this._cols + c] = this._data[c * this._rows + r]! as TArr[number];
      }
    }
    return new Matrix<TArr, TRows, TCols>(out, this._rows, this._cols);
  }

  /**
   * Returns a copy of the matrix as an array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The array.
   */
  toArray(): number[] {
    return Array.from(this._data);
  }

  /**
   * Returns a copy of the underlying storage as a float32 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The float32 array.
   */
  toFloat32Array(): Float32Array {
    return this.toTypedArray(Float32Array.prototype.constructor as unknown as TypedArrayConstructor) as Float32Array;
  }

  /**
   * Returns a copy of the underlying storage as a float64 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The float64 array.
   */
  toFloat64Array(): Float64Array {
    return this.toTypedArray(Float64Array.prototype.constructor as unknown as TypedArrayConstructor) as Float64Array;
  }

  /**
   * Returns a copy of the underlying storage as a int8 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The int8 array.
   */
  toInt8Array(): Int8Array {
    return this.toTypedArray(Int8Array.prototype.constructor as unknown as TypedArrayConstructor) as Int8Array;
  }

  /**
   * Returns a copy of the underlying storage as a int16 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The int16 array.
   */
  toInt16Array(): Int16Array {
    return this.toTypedArray(Int16Array.prototype.constructor as unknown as TypedArrayConstructor) as Int16Array;
  }

  /**
   * Returns a copy of the underlying storage as a int32 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The int32 array.
   */
  toInt32Array(): Int32Array {
    return this.toTypedArray(Int32Array.prototype.constructor as unknown as TypedArrayConstructor) as Int32Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint16 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The uint16 array.
   */
  toUint16Array(): Uint16Array {
    return this.toTypedArray(Uint16Array.prototype.constructor as unknown as TypedArrayConstructor) as Uint16Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint8 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The uint8 array.
   */
  toUint8Array(): Uint8Array {
    return this.toTypedArray(Uint8Array.prototype.constructor as unknown as TypedArrayConstructor) as Uint8Array;
  }

  /**
   * Returns a copy of the underlying storage as a uint8 clamped array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The uint8 clamped array.
   */
  toUint8ClampedArray(): Uint8ClampedArray {
    return this.toTypedArray(Uint8ClampedArray.prototype.constructor as unknown as TypedArrayConstructor) as Uint8ClampedArray;
  }

  /**
   * Returns a copy of the underlying storage as a uint32 array.
   * @param orientation - The orientation of the array (default: ColumnMajor for WebGL).
   * @returns The uint32 array.
   */
  toUint32Array(): Uint32Array {
    return this.toTypedArray(Uint32Array.prototype.constructor as unknown as TypedArrayConstructor) as Uint32Array;
  }
}

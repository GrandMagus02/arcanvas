/**
 * A base class for all matrices.
 */
export abstract class MatrixBase {
  protected _rows: number;
  protected _cols: number;
  protected _data: number[]; // row-major

  protected constructor(rows: number, cols: number, data?: number[]) {
    this._rows = rows;
    this._cols = cols;
    this._data = data ? data.slice() : new Array<number>(rows * cols).fill(0);
  }

  get rows(): number {
    return this._rows;
  }

  get cols(): number {
    return this._cols;
  }

  protected abstract newInstance(rows: number, cols: number, data: number[]): this;

  toArray(): number[] {
    return this._data.slice();
  }

  toArrayOfArrays(): number[][] {
    const out: number[][] = [];
    for (let r = 0; r < this._rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < this._cols; c++) row.push(this._data[r * this._cols + c]!);
      out.push(row);
    }
    return out;
  }

  equals(other: this): boolean {
    if (this._rows !== other.rows || this._cols !== other.cols) return false;
    const a = this._data;
    const b = other.toArray();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  add(other: this): this {
    if (this._rows !== other.rows || this._cols !== other.cols)
      throw new Error("Matrix sizes must match for add");
    return this.newInstance(
      this._rows,
      this._cols,
      this._data.map((v, i) => v + other.toArray()[i]!)
    );
  }

  subtract(other: this): this {
    if (this._rows !== other.rows || this._cols !== other.cols)
      throw new Error("Matrix sizes must match for subtract");
    return this.newInstance(
      this._rows,
      this._cols,
      this._data.map((v, i) => v - other.toArray()[i]!)
    );
  }

  multiplyScalar(scalar: number): this {
    return this.newInstance(
      this._rows,
      this._cols,
      this._data.map((v) => v * scalar)
    );
  }

  transpose(): this {
    const out: number[] = new Array<number>(this._rows * this._cols).fill(0);
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        out[c * this._rows + r] = this._data[r * this._cols + c]!;
      }
    }
    return this.newInstance(this._cols, this._rows, out);
  }

  multiplyMatrix<B extends this>(other: B): this {
    if (this._cols !== other.rows) throw new Error("Incompatible sizes for matrix multiply");
    const out: number[] = new Array<number>(this._rows * other.cols).fill(0);
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < other.cols; c++) {
        let sum = 0;
        for (let k = 0; k < this._cols; k++) {
          sum += this._data[r * this._cols + k]! * other.toArray()[k * other.cols + c]!;
        }
        out[r * other.cols + c] = sum;
      }
    }
    return this.newInstance(this._rows, other.cols, out);
  }
}

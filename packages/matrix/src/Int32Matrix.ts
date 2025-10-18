import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 32-bit integer elements.
 */
export class Int32Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Int32Matrix(rows, cols, data) as unknown as this;
  }

  toInt32Array(): Int32Array {
    return new Int32Array(this._data.map((v) => Math.trunc(v)));
  }
}

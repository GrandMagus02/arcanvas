import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 8-bit integer elements.
 */
export class Int8Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Int8Matrix(rows, cols, data) as unknown as this;
  }

  toInt8Array(): Int8Array {
    return new Int8Array(this._data.map((v) => Math.trunc(v)));
  }
}

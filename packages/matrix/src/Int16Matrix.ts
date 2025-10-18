import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 16-bit integer elements.
 */
export class Int16Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Int16Matrix(rows, cols, data) as unknown as this;
  }

  toInt16Array(): Int16Array {
    return new Int16Array(this._data.map((v) => Math.trunc(v)));
  }
}

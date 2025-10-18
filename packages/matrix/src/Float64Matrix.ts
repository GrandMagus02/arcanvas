import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 64-bit floating point elements.
 */
export class Float64Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Float64Matrix(rows, cols, data) as unknown as this;
  }

  toFloat64Array(): Float64Array {
    return new Float64Array(this._data);
  }
}

import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 32-bit floating point elements.
 */
export class Float32Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Float32Matrix(rows, cols, data) as unknown as this;
  }

  toFloat32Array(): Float32Array {
    return new Float32Array(this._data);
  }
}

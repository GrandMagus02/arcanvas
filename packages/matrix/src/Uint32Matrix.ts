import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 32-bit integer elements.
 */
export class Uint32Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Uint32Matrix(rows, cols, data) as unknown as this;
  }

  toUint32Array(): Uint32Array {
    return new Uint32Array(this._data.map((v) => Math.max(0, Math.trunc(v))));
  }
}

import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 16-bit integer elements.
 */
export class Uint16Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Uint16Matrix(rows, cols, data) as unknown as this;
  }

  toUint16Array(): Uint16Array {
    return new Uint16Array(this._data.map((v) => Math.max(0, Math.trunc(v))));
  }
}

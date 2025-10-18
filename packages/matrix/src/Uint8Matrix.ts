import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 8-bit integer elements.
 */
export class Uint8Matrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Uint8Matrix(rows, cols, data) as unknown as this;
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this._data.map((v) => Math.max(0, Math.trunc(v))));
  }
}

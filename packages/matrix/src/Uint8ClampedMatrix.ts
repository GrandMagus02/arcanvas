import { MatrixBase } from "./MatrixBase";

/**
 * A matrix with 8-bit integer elements clamped to 0-255.
 */
export class Uint8ClampedMatrix extends MatrixBase {
  constructor(rows: number, cols: number, data?: number[]) {
    super(rows, cols, data);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    return new Uint8ClampedMatrix(rows, cols, data) as unknown as this;
  }

  toUint8ClampedArray(): Uint8ClampedArray {
    return new Uint8ClampedArray(this._data.map((v) => Math.min(255, Math.max(0, Math.trunc(v)))));
  }
}

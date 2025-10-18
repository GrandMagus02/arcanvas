import { MatrixBase } from "./MatrixBase";

/**
 * A 2x2 matrix.
 */
export class Matrix2 extends MatrixBase {
  constructor(m00: number, m01: number, m10: number, m11: number) {
    super(2, 2, [m00, m01, m10, m11]);
  }

  static fromArray(array: number[]): Matrix2 {
    if (array.length < 4) throw new Error("Matrix2 requires 4 elements");
    return new Matrix2(array[0]!, array[1]!, array[2]!, array[3]!);
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    if (rows !== 2 || cols !== 2) throw new Error("Matrix2 must be 2x2");
    return Matrix2.fromArray(data) as unknown as this;
  }
}

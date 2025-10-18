import { MatrixBase } from "./MatrixBase";

/**
 * A 3x3 matrix.
 */
export class Matrix3 extends MatrixBase {
  constructor(
    m00: number,
    m01: number,
    m02: number,
    m10: number,
    m11: number,
    m12: number,
    m20: number,
    m21: number,
    m22: number
  ) {
    super(3, 3, [m00, m01, m02, m10, m11, m12, m20, m21, m22]);
  }

  static fromArray(array: number[]): Matrix3 {
    if (array.length < 9) throw new Error("Matrix3 requires 9 elements");
    return new Matrix3(
      array[0]!,
      array[1]!,
      array[2]!,
      array[3]!,
      array[4]!,
      array[5]!,
      array[6]!,
      array[7]!,
      array[8]!
    );
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    if (rows !== 3 || cols !== 3) throw new Error("Matrix3 must be 3x3");
    return Matrix3.fromArray(data) as unknown as this;
  }
}

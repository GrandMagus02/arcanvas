import { MatrixBase } from "./MatrixBase";

/**
 * A 4x4 matrix.
 */
export class Matrix4 extends MatrixBase {
  constructor(
    m00: number,
    m01: number,
    m02: number,
    m03: number,
    m10: number,
    m11: number,
    m12: number,
    m13: number,
    m20: number,
    m21: number,
    m22: number,
    m23: number,
    m30: number,
    m31: number,
    m32: number,
    m33: number
  ) {
    super(4, 4, [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]);
  }

  static fromArray(array: number[]): Matrix4 {
    if (array.length < 16) throw new Error("Matrix4 requires 16 elements");
    return new Matrix4(
      array[0]!,
      array[1]!,
      array[2]!,
      array[3]!,
      array[4]!,
      array[5]!,
      array[6]!,
      array[7]!,
      array[8]!,
      array[9]!,
      array[10]!,
      array[11]!,
      array[12]!,
      array[13]!,
      array[14]!,
      array[15]!
    );
  }

  protected newInstance(rows: number, cols: number, data: number[]): this {
    if (rows !== 4 || cols !== 4) throw new Error("Matrix4 must be 4x4");
    return Matrix4.fromArray(data) as unknown as this;
  }
}

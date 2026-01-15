/**
 * Converts a 3x3 matrix from row-major to column-major order.
 * Row-major: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 * Column-major: [m00, m10, m20, m01, m11, m21, m02, m12, m22]
 *
 * @param rowMajor - Row-major matrix as Float32Array(9)
 * @returns Column-major matrix as Float32Array(9)
 */
export function toColumnMajor3x3(rowMajor: Float32Array): Float32Array {
  if (rowMajor.length !== 9) {
    throw new Error("Matrix must have exactly 9 elements");
  }
  return new Float32Array([
    rowMajor[0]!,
    rowMajor[3]!,
    rowMajor[6]!, // column 0
    rowMajor[1]!,
    rowMajor[4]!,
    rowMajor[7]!, // column 1
    rowMajor[2]!,
    rowMajor[5]!,
    rowMajor[8]!, // column 2
  ]);
}

# Functions

- [toColumnMajor3x3](#tocolumnmajor3x3)
- [toColumnMajor4x4](#tocolumnmajor4x4)

## toColumnMajor3x3

Converts a 3x3 matrix from row-major to column-major order.
Row-major: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
Column-major: [m00, m10, m20, m01, m11, m21, m02, m12, m22]

| Function | Type |
| ---------- | ---------- |
| `toColumnMajor3x3` | `(rowMajor: Float32Array<ArrayBufferLike>) => Float32Array<ArrayBufferLike>` |

Parameters:

* `rowMajor`: - Row-major matrix as Float32Array(9)


Returns:

Column-major matrix as Float32Array(9)

## toColumnMajor4x4

Converts a 4x4 matrix from row-major to column-major order.
Row-major: [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]
Column-major: [m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]

| Function | Type |
| ---------- | ---------- |
| `toColumnMajor4x4` | `(rowMajor: Float32Array<ArrayBufferLike>) => Float32Array<ArrayBufferLike>` |



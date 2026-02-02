# Matrix3

Matrix3 is a 3x3 matrix of 32-bit floating point numbers.

## Static Methods

- [identity](#identity)
- [fromValues](#fromvalues)
- [fromArray](#fromarray)
- [fromMatrix](#frommatrix)

### identity

Creates a new identity matrix.

| Method | Type |
| ---------- | ---------- |
| `identity` | `() => Matrix3<Float32Array<ArrayBufferLike>>` |

Returns:

A new identity matrix.

### fromValues

Creates a Matrix3 from individual values (row-major order).

| Method | Type |
| ---------- | ---------- |
| `fromValues` | `(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) => Matrix3<Float32Array<ArrayBufferLike>>` |

Parameters:

* `m00`: - Element at row 0, column 0.
* `m01`: - Element at row 0, column 1.
* `m02`: - Element at row 0, column 2.
* `m10`: - Element at row 1, column 0.
* `m11`: - Element at row 1, column 1.
* `m12`: - Element at row 1, column 2.
* `m20`: - Element at row 2, column 0.
* `m21`: - Element at row 2, column 1.
* `m22`: - Element at row 2, column 2.


Returns:

A new Matrix3 instance.

### fromArray

Creates a Matrix3 from an array (row-major order).

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `(array: ArrayLike<number>) => Matrix3<Float32Array<ArrayBufferLike>>` |

Parameters:

* `array`: - The array of values (must have at least 9 elements).


Returns:

A new Matrix3 instance.

### fromMatrix

Creates a Matrix3 from another matrix.

| Method | Type |
| ---------- | ---------- |
| `fromMatrix` | `(matrix: Matrix<Float32Array<ArrayBufferLike>, 3, 3>) => Matrix3<Float32Array<ArrayBufferLike>>` |

Parameters:

* `matrix`: - The matrix to copy.


Returns:

A new Matrix3 instance.

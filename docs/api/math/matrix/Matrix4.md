# Matrix4

Matrix4 is a 4x4 matrix of 32-bit floating point numbers.

## Static Methods

- [identity](#identity)
- [fromValues](#fromvalues)
- [fromArray](#fromarray)
- [fromVector](#fromvector)
- [fromMatrix](#frommatrix)

### identity

Creates a new identity matrix.

| Method | Type |
| ---------- | ---------- |
| `identity` | `() => Matrix4<Float32Array<ArrayBufferLike>>` |

Returns:

A new identity matrix.

### fromValues

Creates a Matrix4 from individual values (row-major order).

| Method | Type |
| ---------- | ---------- |
| `fromValues` | `(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number) => Matrix4<...>` |

Parameters:

* `m00`: - Element at row 0, column 0.
* `m01`: - Element at row 0, column 1.
* `m02`: - Element at row 0, column 2.
* `m03`: - Element at row 0, column 3.
* `m10`: - Element at row 1, column 0.
* `m11`: - Element at row 1, column 1.
* `m12`: - Element at row 1, column 2.
* `m13`: - Element at row 1, column 3.
* `m20`: - Element at row 2, column 0.
* `m21`: - Element at row 2, column 1.
* `m22`: - Element at row 2, column 2.
* `m23`: - Element at row 2, column 3.
* `m30`: - Element at row 3, column 0.
* `m31`: - Element at row 3, column 1.
* `m32`: - Element at row 3, column 2.
* `m33`: - Element at row 3, column 3.


Returns:

A new Matrix4 instance.

### fromArray

Creates a Matrix4 from an array (row-major order).

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `(array: ArrayLike<number>) => Matrix4<Float32Array<ArrayBufferLike>>` |

Parameters:

* `array`: - The array of values (must have at least 16 elements).


Returns:

A new Matrix4 instance.

### fromVector

Creates a Matrix from a vector (column vector, 4x1 matrix).
Note: Matrix4 is always 4x4, so this returns a base Matrix instance.

| Method | Type |
| ---------- | ---------- |
| `fromVector` | `(vector: Vector<Float32Array<ArrayBufferLike>, 4>) => Matrix<Float32Array<ArrayBufferLike>, 4, 1>` |

Parameters:

* `vector`: - The vector (must have size 4).


Returns:

A new Matrix instance (4x1 matrix).

### fromMatrix

Creates a Matrix4 from another matrix.

| Method | Type |
| ---------- | ---------- |
| `fromMatrix` | `(matrix: Matrix<Float32Array<ArrayBufferLike>, 4, 4>) => Matrix4<Float32Array<ArrayBufferLike>>` |

Parameters:

* `matrix`: - The matrix to copy.


Returns:

A new Matrix4 instance.

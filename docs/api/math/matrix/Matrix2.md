# Matrix2

Matrix2 is a 2x2 matrix of 32-bit floating point numbers.

## Static Methods

- [identity](#identity)
- [of](#of)
- [fromArray](#fromarray)
- [fromVector](#fromvector)
- [fromMatrix](#frommatrix)

### identity

Creates a new identity matrix.

| Method | Type |
| ---------- | ---------- |
| `identity` | `() => Matrix2<Float32Array<ArrayBufferLike>>` |

Returns:

A new identity matrix.

### of

Creates a Matrix2 from individual values (row-major order).

| Method | Type |
| ---------- | ---------- |
| `of` | `(m00: number, m01: number, m10: number, m11: number) => Matrix2<Float32Array<ArrayBufferLike>>` |

Parameters:

* `m00`: - Element at row 0, column 0.
* `m01`: - Element at row 0, column 1.
* `m10`: - Element at row 1, column 0.
* `m11`: - Element at row 1, column 1.


Returns:

A new Matrix2 instance.

### fromArray

Creates a Matrix2 from an array (row-major order).

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `(array: ArrayLike<number>) => Matrix2<Float32Array<ArrayBufferLike>>` |

Parameters:

* `array`: - The array of values (must have at least 4 elements).


Returns:

A new Matrix2 instance.

### fromVector

Creates a Matrix from a vector (column vector, 2x1 matrix).
Note: Matrix2 is always 2x2, so this returns a base Matrix instance.

| Method | Type |
| ---------- | ---------- |
| `fromVector` | `(vector: Vector<Float32Array<ArrayBufferLike>, 4>) => Matrix2<Float32Array<ArrayBufferLike>>` |

Parameters:

* `vector`: - The vector (must have size 2).


Returns:

A new Matrix instance (2x1 matrix).

### fromMatrix

Creates a Matrix2 from another matrix.

| Method | Type |
| ---------- | ---------- |
| `fromMatrix` | `(matrix: Matrix<Float32Array<ArrayBufferLike>, 2, 2>) => Matrix2<Float32Array<ArrayBufferLike>>` |

Parameters:

* `matrix`: - The matrix to copy.


Returns:

A new Matrix2 instance.

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


# TransformationMatrix

TransformationMatrix is a 4x4 matrix that represents a transformation in 3D space.

## Methods

- [translate](#translate)
- [translateX](#translatex)
- [translateY](#translatey)
- [translateZ](#translatez)
- [scale](#scale)
- [scaleX](#scalex)
- [scaleY](#scaley)
- [scaleZ](#scalez)
- [rotateX](#rotatex)
- [rotateY](#rotatey)
- [rotateZ](#rotatez)
- [invert](#invert)
- [toColumnMajorArray](#tocolumnmajorarray)

### translate

| Method | Type |
| ---------- | ---------- |
| `translate` | `(x?: number, y?: number, z?: number) => this` |

### translateX

| Method | Type |
| ---------- | ---------- |
| `translateX` | `(x: number) => this` |

### translateY

| Method | Type |
| ---------- | ---------- |
| `translateY` | `(y: number) => this` |

### translateZ

| Method | Type |
| ---------- | ---------- |
| `translateZ` | `(z: number) => this` |

### scale

| Method | Type |
| ---------- | ---------- |
| `scale` | `(x?: number, y?: number, z?: number) => this` |

### scaleX

| Method | Type |
| ---------- | ---------- |
| `scaleX` | `(x: number) => this` |

### scaleY

| Method | Type |
| ---------- | ---------- |
| `scaleY` | `(y: number) => this` |

### scaleZ

| Method | Type |
| ---------- | ---------- |
| `scaleZ` | `(z: number) => this` |

### rotateX

| Method | Type |
| ---------- | ---------- |
| `rotateX` | `(rad: number) => this` |

### rotateY

| Method | Type |
| ---------- | ---------- |
| `rotateY` | `(rad: number) => this` |

### rotateZ

| Method | Type |
| ---------- | ---------- |
| `rotateZ` | `(rad: number) => this` |

### invert

Returns the inverse of this matrix.

| Method | Type |
| ---------- | ---------- |
| `invert` | `() => TransformationMatrix` |

Returns:

A new TransformationMatrix that is the inverse of this matrix.

### toColumnMajorArray

Returns the matrix as a column-major Float32Array for WebGL.

| Method | Type |
| ---------- | ---------- |
| `toColumnMajorArray` | `() => Float32Array<ArrayBufferLike>` |

Returns:

A Float32Array in column-major order.

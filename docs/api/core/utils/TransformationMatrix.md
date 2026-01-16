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

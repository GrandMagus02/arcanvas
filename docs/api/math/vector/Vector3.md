# Vector3

Vector3 is a 3D vector of 32-bit floating point numbers.

## Static Methods

- [of](#of)
- [fromArray](#fromarray)
- [fromBuffer](#frombuffer)

### of

Creates a Vector3 from individual components.

| Method | Type |
| ---------- | ---------- |
| `of` | `(x?: number, y?: number, z?: number) => Vector3<Float32Array<ArrayBufferLike>>` |

Parameters:

* `x`: - The x component (default: 0).
* `y`: - The y component (default: 0).
* `z`: - The z component (default: 0).


Returns:

A new Vector3 instance.

### fromArray

Creates a Vector3 from an array-like object.

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `<TNewArr extends NumberArray = Float32Array<ArrayBufferLike>>(array: ArrayLike<number>) => Vector3<TNewArr>` |

Parameters:

* `array`: - The array-like object.
* `_size`: - Optional size (ignored, always 3 for Vector3).


Returns:

A new Vector3 instance.

### fromBuffer

Creates a Vector3 view into an existing ArrayBuffer.

| Method | Type |
| ---------- | ---------- |
| `fromBuffer` | `(buffer: ArrayBuffer, byteOffset?: number) => Vector3<Float32Array<ArrayBufferLike>>` |

Parameters:

* `buffer`: - The array buffer.
* `byteOffset`: - The byte offset (default: 0).


Returns:

A new Vector3 instance.

## Methods

- [cross](#cross)

### cross

Calculates the cross product of this vector and the other vector.
The cross product is only defined for 3D vectors.

| Method | Type |
| ---------- | ---------- |
| `cross` | `(other: this) => this` |

Parameters:

* `other`: - The other vector.


Returns:

This vector after computing the cross product (mutates this).

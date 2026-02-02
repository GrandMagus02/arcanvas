# Vector4

Vector4 is a 4D vector of 32-bit floating point numbers.

## Static Methods

- [of](#of)
- [fromArray](#fromarray)
- [fromBuffer](#frombuffer)

### of

Creates a Vector4 from individual components.

| Method | Type |
| ---------- | ---------- |
| `of` | `(x?: number, y?: number, z?: number, w?: number) => Vector4<Float32Array<ArrayBufferLike>>` |

Parameters:

* `x`: - The x component (default: 0).
* `y`: - The y component (default: 0).
* `z`: - The z component (default: 0).
* `w`: - The w component (default: 0).


Returns:

A new Vector4 instance.

### fromArray

Creates a Vector4 from an array-like object.

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `<TNewArr extends NumberArray = Float32Array<ArrayBufferLike>>(array: ArrayLike<number>) => Vector4<TNewArr>` |

Parameters:

* `array`: - The array-like object.
* `_size`: - Optional size (ignored, always 4 for Vector4).


Returns:

A new Vector4 instance.

### fromBuffer

Creates a Vector4 view into an existing ArrayBuffer.

| Method | Type |
| ---------- | ---------- |
| `fromBuffer` | `(buffer: ArrayBuffer, byteOffset?: number) => Vector4<Float32Array<ArrayBufferLike>>` |

Parameters:

* `buffer`: - The array buffer.
* `byteOffset`: - The byte offset (default: 0).


Returns:

A new Vector4 instance.

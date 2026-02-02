# Vector2

Vector2 is a 2D vector of 32-bit floating point numbers.

## Static Methods

- [of](#of)
- [fromArray](#fromarray)
- [fromBuffer](#frombuffer)

### of

Creates a Vector2 from individual components.

| Method | Type |
| ---------- | ---------- |
| `of` | `(x?: number, y?: number) => Vector2<Float32Array<ArrayBufferLike>>` |

Parameters:

* `x`: - The x component (default: 0).
* `y`: - The y component (default: 0).


Returns:

A new Vector2 instance.

### fromArray

Creates a Vector2 from an array-like object.

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `<TNewArr extends NumberArray = Float32Array<ArrayBufferLike>>(array: ArrayLike<number>) => Vector2<TNewArr>` |

Parameters:

* `array`: - The array-like object.
* `_size`: - Optional size (ignored, always 2 for Vector2).


Returns:

A new Vector2 instance.

### fromBuffer

Creates a Vector2 view into an existing ArrayBuffer.

| Method | Type |
| ---------- | ---------- |
| `fromBuffer` | `(buffer: ArrayBuffer, byteOffset?: number) => Vector2<Float32Array<ArrayBufferLike>>` |

Parameters:

* `buffer`: - The array buffer.
* `byteOffset`: - The byte offset (default: 0).


Returns:

A new Vector2 instance.

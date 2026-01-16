# Vector

WebGL-friendly BaseVector with support for:
- Owned storage (allocates own typed array)
- Views over shared buffers (ArrayBuffer or existing NumberArray + byteOffset)

Notes:
- Prefer Float32Array for WebGL attributes.
- For large collections, create many vectors as views into one big typed array.

## Constructors

`public`: Create from an existing typed array instance (owned or a view).
Use this when you already have a correctly-sized TArr slice/view.

Parameters:

* `data`: - The data of the vector.
* `size`


## Static Methods

- [fromArray](#fromarray)
- [isVector](#isvector)

### fromArray

Creates a vector from an array.

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `<TNewArr extends NumberArray, TNewSize extends number>(array: ArrayLike<number>, size?: TNewSize or undefined) => Vector<TNewArr, TNewSize>` |

Parameters:

* `array`: - The array.
* `size`: - The size of the vector.


Returns:

The new vector.

### isVector

Check if a value is a Vector.

| Method | Type |
| ---------- | ---------- |
| `isVector` | `(value: unknown) => value is Vector<NumberArray, number>` |

Parameters:

* `value`: - The value to check.


Returns:

True if the value is a Vector.

## Methods

- [get](#get)
- [set](#set)
- [add](#add)
- [sub](#sub)
- [mult](#mult)
- [div](#div)
- [scale](#scale)
- [cross](#cross)
- [normalize](#normalize)
- [dot](#dot)
- [equals](#equals)
- [fill](#fill)
- [reverse](#reverse)
- [clone](#clone)
- [toReversed](#toreversed)
- [toArray](#toarray)
- [toFloat32Array](#tofloat32array)
- [toFloat64Array](#tofloat64array)
- [toInt8Array](#toint8array)
- [toInt16Array](#toint16array)
- [toInt32Array](#toint32array)
- [toUint16Array](#touint16array)
- [toUint8Array](#touint8array)
- [toUint8ClampedArray](#touint8clampedarray)
- [toUint32Array](#touint32array)

### get

Returns the value at the given index.

| Method | Type |
| ---------- | ---------- |
| `get` | `(i: number) => number` |

Parameters:

* `i`: - The index.


Returns:

The value.

### set

Sets the value at the given index.

| Method | Type |
| ---------- | ---------- |
| `set` | `(i: number, value: number) => this` |

Parameters:

* `i`: - The index.
* `value`: - The value.


Returns:

The vector.

### add

Adds the other vector to the current vector.

| Method | Type |
| ---------- | ---------- |
| `add` | `(other: number or this) => this` |

Parameters:

* `other`: - The other vector.


Returns:

The added vector.

### sub

Subtracts the other vector from the current vector.

| Method | Type |
| ---------- | ---------- |
| `sub` | `(other: number or this) => this` |

Parameters:

* `other`: - The other vector.


Returns:

The subtracted vector.

### mult

Multiplies the current vector by the other vector.

| Method | Type |
| ---------- | ---------- |
| `mult` | `(other: number or this) => this` |

Parameters:

* `other`: - The other vector.


Returns:

The multiplied vector.

### div

Divides the current vector by the other vector.

| Method | Type |
| ---------- | ---------- |
| `div` | `(other: number or this) => this` |

Parameters:

* `other`: - The other vector.


Returns:

The divided vector.

### scale

Scales the current vector by the given scalar.

| Method | Type |
| ---------- | ---------- |
| `scale` | `(scalar: number) => this` |

Parameters:

* `scalar`: - The scalar.


Returns:

The scaled vector.

### cross

Calculates the cross product of the current vector and the other vector.

| Method | Type |
| ---------- | ---------- |
| `cross` | `(other: this) => this` |

Parameters:

* `other`: - The other vector.


Returns:

The cross product.

### normalize

Normalizes the current vector.

| Method | Type |
| ---------- | ---------- |
| `normalize` | `() => this` |

Returns:

The normalized vector.

### dot

Calculates the dot product of the current vector and the other vector.

| Method | Type |
| ---------- | ---------- |
| `dot` | `(other: this) => number` |

Parameters:

* `other`: - The other vector.


Returns:

The dot product.

### equals

Checks if the current vector is equal to the other vector.

| Method | Type |
| ---------- | ---------- |
| `equals` | `<TOtherArr extends NumberArray, TOtherSize extends number>(other: Vector<TOtherArr, TOtherSize>) => boolean` |

Parameters:

* `other`: - The other vector.


Returns:

True if the vectors are equal, false otherwise.

### fill

Fills the matrix with the given value.

| Method | Type |
| ---------- | ---------- |
| `fill` | `(value: number) => this` |

Parameters:

* `value`: - The value to fill the matrix with.


Returns:

The matrix.

### reverse

Reverses the current vector.

| Method | Type |
| ---------- | ---------- |
| `reverse` | `() => this` |

Returns:

The reversed vector.

### clone

Clone returns an owned clone (copy of data).
If you want a view on the same buffer, use fromBuffer/fromArrayView
in your concrete subclass.

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => Vector<TArr, TSize>` |

### toReversed

Returns a reversed copy of the current vector.

| Method | Type |
| ---------- | ---------- |
| `toReversed` | `() => Vector<TArr, TSize>` |

Returns:

The reversed vector.

### toArray

Returns a plain array copy.

| Method | Type |
| ---------- | ---------- |
| `toArray` | `() => number[]` |

Returns:

The array.

### toFloat32Array

Returns a copy of the underlying storage as a float32 array.

| Method | Type |
| ---------- | ---------- |
| `toFloat32Array` | `() => Float32Array<ArrayBufferLike>` |

Returns:

The float32 array.

### toFloat64Array

Returns a copy of the underlying storage as a float64 array.

| Method | Type |
| ---------- | ---------- |
| `toFloat64Array` | `() => Float64Array<ArrayBufferLike>` |

Returns:

The float64 array.

### toInt8Array

Returns a copy of the underlying storage as a int8 array.

| Method | Type |
| ---------- | ---------- |
| `toInt8Array` | `() => Int8Array<ArrayBufferLike>` |

Returns:

The int8 array.

### toInt16Array

Returns a copy of the underlying storage as a int16 array.

| Method | Type |
| ---------- | ---------- |
| `toInt16Array` | `() => Int16Array<ArrayBufferLike>` |

Returns:

The int16 array.

### toInt32Array

Returns a copy of the underlying storage as a int32 array.

| Method | Type |
| ---------- | ---------- |
| `toInt32Array` | `() => Int32Array<ArrayBufferLike>` |

Returns:

The int32 array.

### toUint16Array

Returns a copy of the underlying storage as a uint16 array.

| Method | Type |
| ---------- | ---------- |
| `toUint16Array` | `() => Uint16Array<ArrayBufferLike>` |

Returns:

The uint16 array.

### toUint8Array

Returns a copy of the underlying storage as a uint8 array.

| Method | Type |
| ---------- | ---------- |
| `toUint8Array` | `() => Uint8Array<ArrayBufferLike>` |

Returns:

The uint8 array.

### toUint8ClampedArray

Returns a copy of the underlying storage as a uint8 clamped array.

| Method | Type |
| ---------- | ---------- |
| `toUint8ClampedArray` | `() => Uint8ClampedArray<ArrayBufferLike>` |

Returns:

The uint8 clamped array.

### toUint32Array

Returns a copy of the underlying storage as a uint32 array.

| Method | Type |
| ---------- | ---------- |
| `toUint32Array` | `() => Uint32Array<ArrayBufferLike>` |

Returns:

The uint32 array.

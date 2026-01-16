
# Types

- [TypedArray](#typedarray)
- [NumberArray](#numberarray)
- [TypedArrayConstructor](#typedarrayconstructor)
- [NumberArrayConstructor](#numberarrayconstructor)

## TypedArray

TypedArray is a union of all typed arrays.

| Type | Type |
| ---------- | ---------- |
| `TypedArray` | `Uint8Array or Int8Array or Uint8ClampedArray or Uint16Array or Int16Array or Uint32Array or Int32Array or Float32Array or Float64Array` |

## NumberArray

ArrayOrTypedArray is a union of all array-like and typed array types.

| Type | Type |
| ---------- | ---------- |
| `NumberArray` | `number[] or TypedArray` |

## TypedArrayConstructor

TypedArrayConstructor is a union of all typed array constructors.

| Type | Type |
| ---------- | ---------- |
| `TypedArrayConstructor` | `| Uint8ArrayConstructor or Int8ArrayConstructor or Uint8ClampedArrayConstructor or Uint16ArrayConstructor or Int16ArrayConstructor or Uint32ArrayConstructor or Int32ArrayConstructor or Float32ArrayConstructor or Float64ArrayConstructor` |

## NumberArrayConstructor

NumberArrayConstructor is a union of all number array constructors.

| Type | Type |
| ---------- | ---------- |
| `NumberArrayConstructor` | `ArrayConstructor or TypedArrayConstructor` |


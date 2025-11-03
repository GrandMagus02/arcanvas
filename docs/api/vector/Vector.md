# BaseVector

WebGL-friendly BaseVector with support for:
- Owned storage (allocates own typed array)
- Views over shared buffers (ArrayBuffer or existing TypedArray + byteOffset)

Notes:
- Prefer Float32Array for WebGL attributes.
- For large collections, create many vectors as views into one big typed array.

## Constructors

`public`: Create from an existing typed array instance (owned or a view).
Use this when you already have a correctly-sized TArr slice/view.

Parameters:

* `data`


## Methods

- [toOwnedCopy](#toownedcopy)
- [get](#get)
- [set](#set)
- [toArray](#toarray)
- [toTypedArray](#totypedarray)
- [add](#add)
- [sub](#sub)
- [mult](#mult)
- [div](#div)
- [scale](#scale)
- [dot](#dot)
- [equals](#equals)
- [clone](#clone)

### toOwnedCopy

Create an owned copy from a plain JS array (or array-like).
Uses the same typed array constructor as this.data at runtime.

| Method | Type |
| ---------- | ---------- |
| `toOwnedCopy` | `() => this` |

### get

Element access with bounds check.
Prefer direct ops in tight loops for performance (e.g. inline usage).

| Method | Type |
| ---------- | ---------- |
| `get` | `(i: number) => number` |

### set

| Method | Type |
| ---------- | ---------- |
| `set` | `(i: number, value: number) => this` |

### toArray

Returns a plain array copy.

| Method | Type |
| ---------- | ---------- |
| `toArray` | `() => number[]` |

### toTypedArray

Returns a typed array copy (owned).

| Method | Type |
| ---------- | ---------- |
| `toTypedArray` | `() => TArr` |

### add

| Method | Type |
| ---------- | ---------- |
| `add` | `(other: this) => this` |

### sub

| Method | Type |
| ---------- | ---------- |
| `sub` | `(other: this) => this` |

### mult

| Method | Type |
| ---------- | ---------- |
| `mult` | `(other: this) => this` |

### div

| Method | Type |
| ---------- | ---------- |
| `div` | `(other: this) => this` |

### scale

| Method | Type |
| ---------- | ---------- |
| `scale` | `(scalar: number) => this` |

### dot

| Method | Type |
| ---------- | ---------- |
| `dot` | `(other: this) => number` |

### equals

| Method | Type |
| ---------- | ---------- |
| `equals` | `(other: this) => boolean` |

### clone

Clone returns an owned clone (copy of data).
If you want a view on the same buffer, use fromBuffer/fromArrayView
in your concrete subclass.

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => this` |

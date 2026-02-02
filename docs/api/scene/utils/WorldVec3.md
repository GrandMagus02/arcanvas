# Functions

- [createWorldVec3](#createworldvec3)
- [copyWorldVec3](#copyworldvec3)
- [cloneWorldVec3](#cloneworldvec3)

## createWorldVec3

Creates a new WorldVec3.

| Function | Type |
| ---------- | ---------- |
| `createWorldVec3` | `(x?: number, y?: number, z?: number) => WorldVec3` |

## copyWorldVec3

Copies values from source to target.

| Function | Type |
| ---------- | ---------- |
| `copyWorldVec3` | `(target: WorldVec3, source: { x: number; y: number; z: number; }) => void` |

## cloneWorldVec3

Creates a clone of the given WorldVec3.

| Function | Type |
| ---------- | ---------- |
| `cloneWorldVec3` | `(v: WorldVec3) => WorldVec3` |


# WorldVec3

Double-precision 3D vector for world coordinates.
Uses JS numbers (64-bit floats) for positions that may be extremely large.

## Methods

- [set](#set)
- [copy](#copy)
- [clone](#clone)
- [add](#add)
- [sub](#sub)
- [scale](#scale)
- [lengthSquared](#lengthsquared)
- [length](#length)
- [distanceTo](#distanceto)

### set

| Method | Type |
| ---------- | ---------- |
| `set` | `(x: number, y: number, z: number) => this` |

### copy

| Method | Type |
| ---------- | ---------- |
| `copy` | `(other: WorldVec3) => this` |

### clone

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => WorldVec3` |

### add

| Method | Type |
| ---------- | ---------- |
| `add` | `(other: WorldVec3) => this` |

### sub

| Method | Type |
| ---------- | ---------- |
| `sub` | `(other: WorldVec3) => this` |

### scale

| Method | Type |
| ---------- | ---------- |
| `scale` | `(s: number) => this` |

### lengthSquared

| Method | Type |
| ---------- | ---------- |
| `lengthSquared` | `() => number` |

### length

| Method | Type |
| ---------- | ---------- |
| `length` | `() => number` |

### distanceTo

| Method | Type |
| ---------- | ---------- |
| `distanceTo` | `(other: WorldVec3) => number` |

## Properties

- [x](#x)
- [y](#y)
- [z](#z)

### x

| Property | Type |
| ---------- | ---------- |
| `x` | `number` |

### y

| Property | Type |
| ---------- | ---------- |
| `y` | `number` |

### z

| Property | Type |
| ---------- | ---------- |
| `z` | `number` |

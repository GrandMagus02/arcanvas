# Functions

- [createWorldVec3](#createworldvec3)
- [cloneWorldVec3](#cloneworldvec3)
- [subWorldVec3](#subworldvec3)
- [addWorldVec3](#addworldvec3)
- [setWorldVec3](#setworldvec3)
- [copyWorldVec3](#copyworldvec3)
- [distanceSquaredWorldVec3](#distancesquaredworldvec3)
- [distanceWorldVec3](#distanceworldvec3)
- [lengthWorldVec3](#lengthworldvec3)
- [worldVec3ToFloat32](#worldvec3tofloat32)
- [worldVec3ToFloat32Into](#worldvec3tofloat32into)
- [isFloat32Safe](#isfloat32safe)
- [computeRelativePosition](#computerelativeposition)
- [computeRelativePositionToFloat32](#computerelativepositiontofloat32)
- [lerpWorldVec3](#lerpworldvec3)
- [equalsWorldVec3](#equalsworldvec3)

## createWorldVec3

Creates a new WorldVec3 with the given coordinates.
For backward compatibility with existing code.

| Function | Type |
| ---------- | ---------- |
| `createWorldVec3` | `(x?: number, y?: number, z?: number) => WorldVec3` |

## cloneWorldVec3

Creates a copy of a WorldVec3.
Handles both class instances and plain objects.

| Function | Type |
| ---------- | ---------- |
| `cloneWorldVec3` | `(v: WorldVec3Like) => WorldVec3` |

## subWorldVec3

Subtracts b from a, returning a new WorldVec3.
Result = a - b

| Function | Type |
| ---------- | ---------- |
| `subWorldVec3` | `(a: WorldVec3Like, b: WorldVec3Like) => WorldVec3` |

## addWorldVec3

Adds two WorldVec3 values, returning a new WorldVec3.
Result = a + b

| Function | Type |
| ---------- | ---------- |
| `addWorldVec3` | `(a: WorldVec3Like, b: WorldVec3Like) => WorldVec3` |

## setWorldVec3

Sets the values of a WorldVec3 in place.

| Function | Type |
| ---------- | ---------- |
| `setWorldVec3` | `(target: WorldVec3, x: number, y: number, z: number) => WorldVec3` |

## copyWorldVec3

Copies values from source to target.

| Function | Type |
| ---------- | ---------- |
| `copyWorldVec3` | `(target: WorldVec3, source: WorldVec3Like) => WorldVec3` |

## distanceSquaredWorldVec3

Calculates the squared distance between two WorldVec3 points.
Use this when comparing distances to avoid the sqrt operation.

| Function | Type |
| ---------- | ---------- |
| `distanceSquaredWorldVec3` | `(a: WorldVec3Like, b: WorldVec3Like) => number` |

## distanceWorldVec3

Calculates the distance between two WorldVec3 points.

| Function | Type |
| ---------- | ---------- |
| `distanceWorldVec3` | `(a: WorldVec3Like, b: WorldVec3Like) => number` |

## lengthWorldVec3

Calculates the length (magnitude) of a WorldVec3.

| Function | Type |
| ---------- | ---------- |
| `lengthWorldVec3` | `(v: WorldVec3Like) => number` |

## worldVec3ToFloat32

Converts a WorldVec3 to a Float32Array for GPU operations.
WARNING: This conversion loses precision for large coordinates!
Only use this for relative/local coordinates that are small (< 1e6).

| Function | Type |
| ---------- | ---------- |
| `worldVec3ToFloat32` | `(v: WorldVec3Like) => Float32Array<ArrayBufferLike>` |

## worldVec3ToFloat32Into

Converts a WorldVec3 to a Float32Array, writing to an existing array.
This avoids allocation when updating frequently.

| Function | Type |
| ---------- | ---------- |
| `worldVec3ToFloat32Into` | `(v: WorldVec3Like, target: Float32Array<ArrayBufferLike>, offset?: number) => void` |

## isFloat32Safe

Checks if a WorldVec3 is safe to convert to Float32 without significant precision loss.
Float32 has ~7 significant decimal digits, so values > ~1e6 start losing unit-level precision.

| Function | Type |
| ---------- | ---------- |
| `isFloat32Safe` | `(v: WorldVec3Like, threshold?: number) => boolean` |

Parameters:

* `threshold`: The maximum safe magnitude (default: 1,000,000)


## computeRelativePosition

Computes the relative position of `position` with respect to `origin`.
Result = position - origin

This is the core operation for camera-relative rendering.
The result should be small enough to safely convert to Float32.

| Function | Type |
| ---------- | ---------- |
| `computeRelativePosition` | `(position: WorldVec3Like, origin: WorldVec3Like) => WorldVec3` |

## computeRelativePositionToFloat32

Computes relative position and writes directly to a Float32Array.
This is optimized for the render loop where we want to avoid allocations.

| Function | Type |
| ---------- | ---------- |
| `computeRelativePositionToFloat32` | `(position: WorldVec3Like, origin: WorldVec3Like, target: Float32Array<ArrayBufferLike>, offset?: number) => void` |

## lerpWorldVec3

Linearly interpolates between two WorldVec3 positions.
Result = a + t * (b - a)

| Function | Type |
| ---------- | ---------- |
| `lerpWorldVec3` | `(a: WorldVec3Like, b: WorldVec3Like, t: number) => WorldVec3` |

## equalsWorldVec3

Checks if two WorldVec3 are approximately equal within a tolerance.

| Function | Type |
| ---------- | ---------- |
| `equalsWorldVec3` | `(a: WorldVec3Like, b: WorldVec3Like, epsilon?: number) => boolean` |


# WorldVec3

WorldVec3 represents a position in world-space using double-precision numbers.

JavaScript numbers are 64-bit IEEE 754 doubles, which provide:
- ~15-17 significant decimal digits
- Safe integer range up to ±9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER)

For world coordinates, this allows representing positions with sub-millimeter
precision across solar system scales (~10^12 meters).

This class extends Vector3 with Float64Array for double-precision storage,
while maintaining compatibility with the simple object interface { x, y, z }.

## Constructors

`public`: Creates a new WorldVec3 with the given coordinates.

Parameters:

* `x`
* `y`
* `z`


## Static Methods

- [fromObject](#fromobject)
- [fromVector3](#fromvector3)

### fromObject

Creates a new WorldVec3 from an object with x, y, z properties.

| Method | Type |
| ---------- | ---------- |
| `fromObject` | `(obj: { x: number; y: number; z: number; }) => WorldVec3` |

### fromVector3

Creates a new WorldVec3 from a Vector3 (converts to double precision).

| Method | Type |
| ---------- | ---------- |
| `fromVector3` | `(v: Vector3<Float32Array<ArrayBufferLike>>) => WorldVec3` |

## Methods

- [toObject](#toobject)
- [toFloat32ArrayInto](#tofloat32arrayinto)
- [isFloat32Safe](#isfloat32safe)
- [relativeTo](#relativeto)
- [relativeToInto](#relativetointo)
- [lerp](#lerp)
- [equalsApprox](#equalsapprox)
- [distanceSquared](#distancesquared)
- [distance](#distance)

### toObject

Converts this WorldVec3 to a plain object.

| Method | Type |
| ---------- | ---------- |
| `toObject` | `() => { x: number; y: number; z: number; }` |

### toFloat32ArrayInto

Writes this WorldVec3 to a Float32Array at the given offset.
This avoids allocation when updating frequently.

| Method | Type |
| ---------- | ---------- |
| `toFloat32ArrayInto` | `(target: Float32Array<ArrayBufferLike>, offset?: number) => void` |

### isFloat32Safe

Checks if this WorldVec3 is safe to convert to Float32 without significant precision loss.
Float32 has ~7 significant decimal digits, so values > ~1e6 start losing unit-level precision.

| Method | Type |
| ---------- | ---------- |
| `isFloat32Safe` | `(threshold?: number) => boolean` |

### relativeTo

Computes the relative position of this vector with respect to an origin.
Result = this - origin

| Method | Type |
| ---------- | ---------- |
| `relativeTo` | `(origin: WorldVec3) => WorldVec3` |

### relativeToInto

Computes relative position and writes directly to a Float32Array.
This is optimized for the render loop where we want to avoid allocations.

| Method | Type |
| ---------- | ---------- |
| `relativeToInto` | `(origin: WorldVec3, target: Float32Array<ArrayBufferLike>, offset?: number) => void` |

### lerp

Linearly interpolates between this vector and another.
Result = this + t * (other - this)

| Method | Type |
| ---------- | ---------- |
| `lerp` | `(other: WorldVec3, t: number) => WorldVec3` |

### equalsApprox

Checks if this vector is approximately equal to another within a tolerance.

| Method | Type |
| ---------- | ---------- |
| `equalsApprox` | `(other: WorldVec3, epsilon?: number) => boolean` |

### distanceSquared

Calculates the squared distance to another WorldVec3.

| Method | Type |
| ---------- | ---------- |
| `distanceSquared` | `(other: WorldVec3) => number` |

### distance

Calculates the distance to another WorldVec3.

| Method | Type |
| ---------- | ---------- |
| `distance` | `(other: WorldVec3) => number` |

# Types

- [WorldVec3Like](#worldvec3like)

## WorldVec3Like

Type alias for backward compatibility.
WorldVec3 can be used as both a class and an interface-like type.

| Type | Type |
| ---------- | ---------- |
| `WorldVec3Like` | `WorldVec3 or { x: number; y: number; z: number }` |


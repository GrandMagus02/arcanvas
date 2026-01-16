# WorldTransform

WorldTransform extends Transform to support double-precision world coordinates.

This is the key to supporting "infinite" worlds:
- `worldPosition` stores the true position in double-precision (JS number)
- `localPosition` stores the position relative to the world origin (Float32)
- `_matrix` is computed from localPosition for GPU rendering

Workflow:
1. Set `worldPosition` to the object's true position
2. Call `updateLocal(origin)` with the current world origin
3. `localPosition` and `modelMatrix` are now ready for rendering

For rotation and scale, we continue to use the existing matrix-based approach
since these don't suffer from precision issues like translation.

## Methods

- [setWorldPosition](#setworldposition)
- [translateWorld](#translateworld)
- [setRotation](#setrotation)
- [setScale](#setscale)
- [setUniformScale](#setuniformscale)
- [updateLocal](#updatelocal)
- [clone](#clone)

### setWorldPosition

Sets world position by components.

| Method | Type |
| ---------- | ---------- |
| `setWorldPosition` | `(x: number, y: number, z: number) => this` |

### translateWorld

Translates the world position by the given delta.

| Method | Type |
| ---------- | ---------- |
| `translateWorld` | `(dx: number, dy: number, dz: number) => this` |

### setRotation

Sets rotation from Euler angles.

| Method | Type |
| ---------- | ---------- |
| `setRotation` | `(x: number, y: number, z: number) => this` |

### setScale

Sets scale factors.

| Method | Type |
| ---------- | ---------- |
| `setScale` | `(x: number, y: number, z: number) => this` |

### setUniformScale

Sets uniform scale.

| Method | Type |
| ---------- | ---------- |
| `setUniformScale` | `(s: number) => this` |

### updateLocal

Updates the local position from world position and the given origin.
This MUST be called before rendering when the world origin changes.

| Method | Type |
| ---------- | ---------- |
| `updateLocal` | `(origin: WorldVec3) => void` |

Parameters:

* `origin`: The current world origin (typically from WorldOrigin.originRef)


### clone

Creates a copy of this transform.

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => WorldTransform` |

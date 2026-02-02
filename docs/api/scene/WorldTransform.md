# WorldTransform

WorldTransform extends Transform to support double-precision world coordinates.

This is the key to supporting "infinite" worlds:
- `worldPosition` stores the true position in double-precision (JS number)
- `localPosition` stores the position relative to the world origin (Float32)
- `_matrix` is computed from localPosition for GPU rendering

## Methods

- [setWorldPosition](#setworldposition)
- [translateWorld](#translateworld)
- [setRotation](#setrotation)
- [setScale](#setscale)
- [setUniformScale](#setuniformscale)
- [updateLocal](#updatelocal)
- [clone](#clone)

### setWorldPosition

| Method | Type |
| ---------- | ---------- |
| `setWorldPosition` | `(x: number, y: number, z: number) => this` |

### translateWorld

| Method | Type |
| ---------- | ---------- |
| `translateWorld` | `(dx: number, dy: number, dz: number) => this` |

### setRotation

| Method | Type |
| ---------- | ---------- |
| `setRotation` | `(x: number, y: number, z: number) => this` |

### setScale

| Method | Type |
| ---------- | ---------- |
| `setScale` | `(x: number, y: number, z: number) => this` |

### setUniformScale

| Method | Type |
| ---------- | ---------- |
| `setUniformScale` | `(s: number) => this` |

### updateLocal

Updates the local position from world position and the given origin.

| Method | Type |
| ---------- | ---------- |
| `updateLocal` | `(origin: WorldVec3) => void` |

### clone

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => WorldTransform` |

# WorldRenderObject

WorldRenderObject is a RenderObject that supports world-space coordinates.

Use this for objects that need to exist in a large world where
coordinates might exceed Float32 precision limits.

Implements WorldPositioned interface for use with WorldOrigin manager.

## Methods

- [setWorldPosition](#setworldposition)
- [translateWorld](#translateworld)
- [setRotation](#setrotation)
- [setScale](#setscale)
- [setUniformScale](#setuniformscale)
- [updateLocal](#updatelocal)

### setWorldPosition

Sets the world position by components.

| Method | Type |
| ---------- | ---------- |
| `setWorldPosition` | `(x: number, y: number, z: number) => this` |

### translateWorld

Translates the object in world space.

| Method | Type |
| ---------- | ---------- |
| `translateWorld` | `(dx: number, dy: number, dz: number) => this` |

### setRotation

Sets rotation (Euler angles in radians).

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

Updates local position from world position and origin.
Call this when the world origin changes or before rendering.

| Method | Type |
| ---------- | ---------- |
| `updateLocal` | `(origin: WorldVec3) => void` |

## Properties

- [mesh](#mesh)
- [material](#material)
- [transform](#transform)

### mesh

| Property | Type |
| ---------- | ---------- |
| `mesh` | `Mesh` |

### material

| Property | Type |
| ---------- | ---------- |
| `material` | `BaseMaterial` |

### transform

| Property | Type |
| ---------- | ---------- |
| `transform` | `WorldTransform` |

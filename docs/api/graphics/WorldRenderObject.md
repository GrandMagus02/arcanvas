# WorldRenderObject

WorldRenderObject is a RenderObject that supports world-space coordinates.

Use this for objects in large worlds where coordinates might exceed
Float32 precision limits.

## Methods

- [setWorldPosition](#setworldposition)
- [translateWorld](#translateworld)
- [setRotation](#setrotation)
- [setScale](#setscale)
- [setUniformScale](#setuniformscale)
- [updateLocal](#updatelocal)

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

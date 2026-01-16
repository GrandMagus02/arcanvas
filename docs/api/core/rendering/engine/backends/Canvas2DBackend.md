# Canvas2DBackend

Canvas2D rendering backend implementation.
Renders meshes using CPU-based 2D canvas operations.

## Methods

- [beginFrame](#beginframe)
- [endFrame](#endframe)
- [prepareMesh](#preparemesh)
- [prepareMaterial](#preparematerial)
- [drawMesh](#drawmesh)

### beginFrame

| Method | Type |
| ---------- | ---------- |
| `beginFrame` | `(viewportWidth: number, viewportHeight: number) => void` |

### endFrame

| Method | Type |
| ---------- | ---------- |
| `endFrame` | `() => void` |

### prepareMesh

| Method | Type |
| ---------- | ---------- |
| `prepareMesh` | `(_mesh: Mesh) => void` |

### prepareMaterial

| Method | Type |
| ---------- | ---------- |
| `prepareMaterial` | `(_material: BaseMaterial) => void` |

### drawMesh

| Method | Type |
| ---------- | ---------- |
| `drawMesh` | `(args: DrawArgs) => void` |

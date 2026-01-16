# WebGLBackend

WebGL implementation of the render backend.
Uses ShaderProvider interface for custom material shaders.

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
| `prepareMesh` | `(mesh: Mesh) => void` |

### prepareMaterial

| Method | Type |
| ---------- | ---------- |
| `prepareMaterial` | `(_material: BaseMaterial) => void` |

### drawMesh

| Method | Type |
| ---------- | ---------- |
| `drawMesh` | `(args: DrawArgs) => void` |

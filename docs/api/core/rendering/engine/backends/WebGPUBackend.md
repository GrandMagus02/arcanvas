# WebGPUBackend

WebGPU rendering backend implementation (stub).
Not yet implemented - throws errors on all operations.

## Methods

- [beginFrame](#beginframe)
- [endFrame](#endframe)
- [prepareMesh](#preparemesh)
- [prepareMaterial](#preparematerial)
- [drawMesh](#drawmesh)

### beginFrame

| Method | Type |
| ---------- | ---------- |
| `beginFrame` | `(_viewportWidth: number, _viewportHeight: number) => void` |

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
| `drawMesh` | `(_args: DrawArgs) => void` |

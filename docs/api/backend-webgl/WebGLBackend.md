# WebGLBackend

WebGL implementation of the render backend.

## Methods

- [setDebugMode](#setdebugmode)
- [getDebugMode](#getdebugmode)
- [beginFrame](#beginframe)
- [endFrame](#endframe)
- [prepareMesh](#preparemesh)
- [prepareMaterial](#preparematerial)
- [drawMesh](#drawmesh)
- [dispose](#dispose)

### setDebugMode

Sets the debug visualization mode.

| Method | Type |
| ---------- | ---------- |
| `setDebugMode` | `(options: DebugOptions) => void` |

### getDebugMode

Gets the current debug options.

| Method | Type |
| ---------- | ---------- |
| `getDebugMode` | `() => DebugOptions` |

### beginFrame

Begins a new frame, setting up viewport and clearing buffers.

| Method | Type |
| ---------- | ---------- |
| `beginFrame` | `(viewportWidth: number, viewportHeight: number) => void` |

### endFrame

Ends the current frame.

| Method | Type |
| ---------- | ---------- |
| `endFrame` | `() => void` |

### prepareMesh

Prepares mesh data for rendering (creates/updates buffers).

| Method | Type |
| ---------- | ---------- |
| `prepareMesh` | `(mesh: Mesh) => void` |

### prepareMaterial

Prepares material for rendering (creates/updates textures, pipelines).

| Method | Type |
| ---------- | ---------- |
| `prepareMaterial` | `(material: BaseMaterial) => void` |

### drawMesh

Draws a mesh with the given arguments.

| Method | Type |
| ---------- | ---------- |
| `drawMesh` | `(args: DrawArgs) => void` |

### dispose

Disposes of all resources held by this backend.

| Method | Type |
| ---------- | ---------- |
| `dispose` | `() => void` |

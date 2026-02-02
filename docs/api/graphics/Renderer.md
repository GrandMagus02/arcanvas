# Renderer

Standard renderer for Scene and Camera.

## Methods

- [setDebugMode](#setdebugmode)
- [getDebugMode](#getdebugmode)
- [setDebugTriangles](#setdebugtriangles)
- [render](#render)

### setDebugMode

Sets the debug visualization mode.

| Method | Type |
| ---------- | ---------- |
| `setDebugMode` | `(mode: DebugMode, options?: Partial<Omit<DebugOptions, "mode">> or undefined) => void` |

Parameters:

* `mode`: - The debug mode to enable, or "none" to disable.
* `options`: - Additional debug options.


### getDebugMode

Gets the current debug options.

| Method | Type |
| ---------- | ---------- |
| `getDebugMode` | `() => DebugOptions` |

### setDebugTriangles

Convenience method to toggle debug triangles mode.

| Method | Type |
| ---------- | ---------- |
| `setDebugTriangles` | `(enabled: boolean, colorSeed?: number or undefined) => void` |

Parameters:

* `enabled`: - Whether to enable or disable debug triangles.
* `colorSeed`: - Optional seed for consistent colors.


### render

| Method | Type |
| ---------- | ---------- |
| `render` | `(scene: RenderableScene, camera: RenderableCamera) => void` |

# Interfaces

- [RenderableScene](#renderablescene)
- [RenderableCamera](#renderablecamera)

## RenderableScene

Interface for scene that can be rendered.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `viewport` | `{ width: number; height: number; }` |  |
| `lights` | `{ type: "directional" or "point" or "spot"; position?: [number, number, number] or undefined; direction?: [number, number, number] or undefined; color: [number, number, number]; intensity: number; }[]` |  |
| `renderObjects` | `{ mesh: Mesh; material: BaseMaterial; transform: { modelMatrix: Float32Array<ArrayBufferLike>; }; }[]` |  |


## RenderableCamera

Interface for camera.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `view` | `{ data: Float32Array<ArrayBufferLike>; }` |  |
| `projection` | `{ data: Float32Array<ArrayBufferLike>; }` |  |
| `position` | `{ x: number; y: number; z: number; }` |  |


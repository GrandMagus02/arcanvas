
# Interfaces

- [LightInfo](#lightinfo)
- [DrawArgs](#drawargs)
- [IRenderBackend](#irenderbackend)

## LightInfo

Light information for rendering.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `type` | `"directional" or "point" or "spot"` |  |
| `position` | `[number, number, number] or undefined` |  |
| `direction` | `[number, number, number] or undefined` |  |
| `color` | `[number, number, number]` |  |
| `intensity` | `number` |  |


## DrawArgs

Arguments for drawing a mesh.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `mesh` | `Mesh` |  |
| `material` | `BaseMaterial` |  |
| `modelMatrix` | `Float32Array<ArrayBufferLike>` |  |
| `viewMatrix` | `Float32Array<ArrayBufferLike>` |  |
| `projMatrix` | `Float32Array<ArrayBufferLike>` |  |
| `cameraPosition` | `[number, number, number]` |  |
| `lights` | `LightInfo[]` |  |


## IRenderBackend

Render backend interface.

This is the low-level contract for GPU/CPU resource management.
Implementations translate abstract Mesh/Material data into API calls.

| Property | Type | Description |
| ---------- | ---------- | ---------- |


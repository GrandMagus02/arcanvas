
# Interfaces

- [LightInfo](#lightinfo)
- [DrawArgs](#drawargs)
- [IRenderBackend](#irenderbackend)

## LightInfo



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `type` | `"directional" or "point" or "spot"` |  |
| `position` | `[number, number, number] or undefined` |  |
| `direction` | `[number, number, number] or undefined` |  |
| `color` | `[number, number, number]` |  |
| `intensity` | `number` |  |


## DrawArgs



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



| Property | Type | Description |
| ---------- | ---------- | ---------- |


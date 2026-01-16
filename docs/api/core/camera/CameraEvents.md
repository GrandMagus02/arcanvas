
# Enum

- [CameraEventKey](#cameraeventkey)

## CameraEventKey



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Activate` | `"activate"` |  |
| `Deactivate` | `"deactivate"` |  |
| `Move` | `"move"` |  |
| `Zoom` | `"zoom"` |  |
| `Rotate` | `"rotate"` |  |


# Types

- [CameraEvents](#cameraevents)

## CameraEvents

Events emitted by the Camera class.

| Type | Type |
| ---------- | ---------- |
| `CameraEvents` | `{ [CameraEventKey.Activate]: (camera: Camera) => void; [CameraEventKey.Deactivate]: (camera: Camera) => void; [CameraEventKey.Move]: (camera: Camera) => void; [CameraEventKey.Zoom]: (camera: Camera) => void; [CameraEventKey.Rotate]: (camera: Camera) => void; }` |


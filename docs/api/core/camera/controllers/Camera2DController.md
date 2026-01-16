# Camera2DController

2D camera controller that provides pan (drag) and zoom (wheel) functionality.
Designed for 2D editors and pixel art applications using orthographic projection.

## Methods

- [attach](#attach)
- [detach](#detach)
- [handleMouseDown](#handlemousedown)
- [handleMouseMove](#handlemousemove)
- [handleMouseUp](#handlemouseup)
- [handleWheel](#handlewheel)
- [enable](#enable)
- [disable](#disable)
- [isEnabled](#isenabled)

### attach

Attach the controller to a camera instance.

| Method | Type |
| ---------- | ---------- |
| `attach` | `(camera: Camera) => void` |

### detach

Detach the controller from the current camera.

| Method | Type |
| ---------- | ---------- |
| `detach` | `() => void` |

### handleMouseDown

Handle mouse down event (e.g., start panning).

| Method | Type |
| ---------- | ---------- |
| `handleMouseDown` | `(event: MouseEvent) => void` |

### handleMouseMove

Handle mouse move event (e.g., continue panning).

| Method | Type |
| ---------- | ---------- |
| `handleMouseMove` | `(event: MouseEvent) => void` |

### handleMouseUp

Handle mouse up event (e.g., end panning).

| Method | Type |
| ---------- | ---------- |
| `handleMouseUp` | `(event: MouseEvent) => void` |

### handleWheel

Handle wheel event (e.g., zoom).

| Method | Type |
| ---------- | ---------- |
| `handleWheel` | `(event: WheelEvent) => void` |

### enable

Enable the controller (start listening to events).

| Method | Type |
| ---------- | ---------- |
| `enable` | `() => void` |

### disable

Disable the controller (stop listening to events).

| Method | Type |
| ---------- | ---------- |
| `disable` | `() => void` |

### isEnabled

Check if the controller is currently enabled.

| Method | Type |
| ---------- | ---------- |
| `isEnabled` | `() => boolean` |

# Interfaces

- [Camera2DControllerOptions](#camera2dcontrolleroptions)

## Camera2DControllerOptions

Options for configuring a Camera2DController.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `minZoom` | `number or undefined` | Minimum zoom level (default: 0.1). |
| `maxZoom` | `number or undefined` | Maximum zoom level (default: 10). |
| `zoomSensitivity` | `number or undefined` | Zoom sensitivity factor (default: 0.001). |
| `panSensitivity` | `number or undefined` | Pan sensitivity factor (default: 1.0). |
| `invertYAxis` | `boolean or undefined` | Invert Y axis for panning (default: false). |
| `invertXAxis` | `boolean or undefined` | Invert X axis for zooming (default: false). |


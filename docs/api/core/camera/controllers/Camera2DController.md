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
| `keysUp` | `string[] or undefined` | Keys that trigger upward movement (default: ["w", "W", "ArrowUp"]). |
| `keysDown` | `string[] or undefined` | Keys that trigger downward movement (default: ["s", "S", "ArrowDown"]). |
| `keysLeft` | `string[] or undefined` | Keys that trigger leftward movement (default: ["a", "A", "ArrowLeft"]). |
| `keysRight` | `string[] or undefined` | Keys that trigger rightward movement (default: ["d", "D", "ArrowRight"]). |
| `keyboardMoveSpeed` | `number or undefined` | Base movement speed in world units per second (default: 100.0). Movement is frame-rate independent. |
| `shiftMultiplier` | `number or undefined` | Movement speed multiplier when Shift is held (default: 2.0). |
| `ctrlMultiplier` | `number or undefined` | Movement speed multiplier when Ctrl is held (default: 0.5). |
| `captureMouseOnDocument` | `boolean or undefined` | When true, mousemove and mouseup events are captured on the document instead of the canvas, allowing panning to continue when the mouse moves outside the canvas (default: false). |
| `panMouseButton` | `number or number[] or undefined` | Mouse button(s) required to trigger panning (default: 0 for left button). 0 = left, 1 = middle, 2 = right, or array of buttons. |
| `panModifierKeys` | `string or string[] or undefined` | Modifier keys that must be pressed for panning to work (default: []). Valid values: "Shift", "Control", "Alt", "Meta", "Space", or array of keys. |
| `cursorDefault` | `string or undefined` | Cursor style when controller is enabled but not panning (default: "default"). |
| `cursorPanning` | `string or undefined` | Cursor style when panning is active (default: "grabbing"). |
| `cursorDisabled` | `string or undefined` | Cursor style when controller is disabled (default: "default"). |
| `cursorReady` | `string or undefined` | Cursor style when panning is available but modifier keys are not pressed (default: "grab"). |
| `useLastActiveKey` | `boolean or undefined` | When true, if conflicting keys are pressed (e.g., both A and D), the last pressed key takes precedence instead of canceling out (default: false). |


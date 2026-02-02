# PanGesture

Pan/drag gesture detector.
Generic drag detector usable for camera panning, object dragging, selection rectangle, drag-and-drop.

## Methods

- [handle](#handle)
- [reset](#reset)

### handle

Handles an input event.

| Method | Type |
| ---------- | ---------- |
| `handle` | `(event: NormalizedInputEvent, _state: InputState) => void` |

### reset

Resets the gesture to idle state.

| Method | Type |
| ---------- | ---------- |
| `reset` | `() => void` |

# Interfaces

- [PanGestureConfig](#pangestureconfig)

## PanGestureConfig

Configuration for PanGesture.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `threshold` | `number or undefined` |  |
| `onStart` | `((startPos: InputPosition, event: NormalizedInputEvent) => void) or undefined` |  |
| `onUpdate` | `((deltaX: number, deltaY: number, currentPos: InputPosition, startPos: InputPosition, event: NormalizedInputEvent) => void) or undefined` |  |
| `onEnd` | `((deltaX: number, deltaY: number, totalDistance: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onCancel` | `((reason: string) => void) or undefined` |  |


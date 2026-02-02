# PinchGesture

Pinch/zoom gesture detector for two-finger zoom.

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

- [PinchGestureConfig](#pinchgestureconfig)

## PinchGestureConfig

Configuration for PinchGesture.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `minDistance` | `number or undefined` |  |
| `onStart` | `((centerX: number, centerY: number, distance: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onUpdate` | `((scale: number, centerX: number, centerY: number, distance: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onEnd` | `((scale: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onCancel` | `((reason: string) => void) or undefined` |  |


# RotateGesture

Rotation gesture detector for two-finger rotation.

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

- [RotateGestureConfig](#rotategestureconfig)

## RotateGestureConfig

Configuration for RotateGesture.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `minAngle` | `number or undefined` |  |
| `onStart` | `((centerX: number, centerY: number, angle: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onUpdate` | `((angle: number, deltaAngle: number, centerX: number, centerY: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onEnd` | `((totalAngle: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onCancel` | `((reason: string) => void) or undefined` |  |


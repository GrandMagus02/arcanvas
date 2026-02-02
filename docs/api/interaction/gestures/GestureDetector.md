# GestureDetector

Gesture detector that manages multiple gesture types.

## Methods

- [enablePan](#enablepan)
- [enablePinch](#enablepinch)
- [enableRotate](#enablerotate)
- [enableSwipe](#enableswipe)
- [registerHandler](#registerhandler)
- [handle](#handle)
- [reset](#reset)

### enablePan

Enables pan gesture detection.

| Method | Type |
| ---------- | ---------- |
| `enablePan` | `(config?: undefined) => PanGesture` |

### enablePinch

Enables pinch gesture detection.

| Method | Type |
| ---------- | ---------- |
| `enablePinch` | `(config?: undefined) => PinchGesture` |

### enableRotate

Enables rotate gesture detection.

| Method | Type |
| ---------- | ---------- |
| `enableRotate` | `(config?: undefined) => RotateGesture` |

### enableSwipe

Enables swipe gesture detection.

| Method | Type |
| ---------- | ---------- |
| `enableSwipe` | `(config?: undefined) => SwipeGesture` |

### registerHandler

Registers a custom gesture handler.

| Method | Type |
| ---------- | ---------- |
| `registerHandler` | `(handler: GestureHandler<unknown>) => () => void` |

### handle

Processes an input event through all enabled gesture detectors.

| Method | Type |
| ---------- | ---------- |
| `handle` | `(event: NormalizedInputEvent, state: InputState) => void` |

### reset

Resets all gestures.

| Method | Type |
| ---------- | ---------- |
| `reset` | `() => void` |

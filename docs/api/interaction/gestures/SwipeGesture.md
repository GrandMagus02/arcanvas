# SwipeGesture

Swipe gesture detector for quick directional movements.

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

# Enum

- [SwipeDirection](#swipedirection)

## SwipeDirection

Swipe direction.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Left` | `"left"` |  |
| `Right` | `"right"` |  |
| `Up` | `"up"` |  |
| `Down` | `"down"` |  |


# Interfaces

- [SwipeGestureConfig](#swipegestureconfig)

## SwipeGestureConfig

Configuration for SwipeGesture.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `minVelocity` | `number or undefined` |  |
| `minDistance` | `number or undefined` |  |
| `direction` | `SwipeDirection or "horizontal" or "vertical" or "both" or undefined` |  |
| `onSwipe` | `((direction: SwipeDirection, distance: number, velocity: number, event: NormalizedInputEvent) => void) or undefined` |  |
| `onCancel` | `((reason: string) => void) or undefined` |  |


# TouchDevice

Touch-specific device utilities.

## Static Methods

- [getTouches](#gettouches)
- [getTouchCount](#gettouchcount)
- [getTouchByIdentifier](#gettouchbyidentifier)
- [getPrimaryTouch](#getprimarytouch)
- [isMultiTouch](#ismultitouch)

### getTouches

Gets all touch points from an event.

| Method | Type |
| ---------- | ---------- |
| `getTouches` | `(event: NormalizedInputEvent) => TouchPoint[]` |

### getTouchCount

Gets the number of active touches.

| Method | Type |
| ---------- | ---------- |
| `getTouchCount` | `(event: NormalizedInputEvent) => number` |

### getTouchByIdentifier

Gets a specific touch point by identifier.

| Method | Type |
| ---------- | ---------- |
| `getTouchByIdentifier` | `(event: NormalizedInputEvent, identifier: number) => TouchPoint or undefined` |

### getPrimaryTouch

Gets the primary (first) touch point.

| Method | Type |
| ---------- | ---------- |
| `getPrimaryTouch` | `(event: NormalizedInputEvent) => TouchPoint or undefined` |

### isMultiTouch

Checks if the event has multiple touches (multi-touch).

| Method | Type |
| ---------- | ---------- |
| `isMultiTouch` | `(event: NormalizedInputEvent) => boolean` |

# DeviceDetector

Detects the input device type from an event.

## Static Methods

- [detect](#detect)
- [isDevice](#isdevice)
- [isPointer](#ispointer)
- [isTouch](#istouch)
- [isPen](#ispen)

### detect

Detects device type from a normalized event.

| Method | Type |
| ---------- | ---------- |
| `detect` | `(event: NormalizedInputEvent) => InputDevice` |

### isDevice

Checks if an event is from a specific device type.

| Method | Type |
| ---------- | ---------- |
| `isDevice` | `(event: NormalizedInputEvent, device: InputDevice) => boolean` |

### isPointer

Checks if an event is from a pointer device (mouse, pen, or touch via pointer events).

| Method | Type |
| ---------- | ---------- |
| `isPointer` | `(event: NormalizedInputEvent) => boolean` |

### isTouch

Checks if an event is from a touch device.

| Method | Type |
| ---------- | ---------- |
| `isTouch` | `(event: NormalizedInputEvent) => boolean` |

### isPen

Checks if an event is from a pen/stylus device.

| Method | Type |
| ---------- | ---------- |
| `isPen` | `(event: NormalizedInputEvent) => boolean` |

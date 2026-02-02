# MouseDevice

Mouse-specific device utilities.

## Static Methods

- [isButtonPressed](#isbuttonpressed)
- [getPressedButtons](#getpressedbuttons)
- [isLeftButtonPressed](#isleftbuttonpressed)
- [isRightButtonPressed](#isrightbuttonpressed)
- [isMiddleButtonPressed](#ismiddlebuttonpressed)

### isButtonPressed

Checks if a specific mouse button is pressed in an event.

| Method | Type |
| ---------- | ---------- |
| `isButtonPressed` | `(event: NormalizedInputEvent, button: MouseButton) => boolean` |

### getPressedButtons

Gets all pressed buttons from an event.

| Method | Type |
| ---------- | ---------- |
| `getPressedButtons` | `(event: NormalizedInputEvent) => MouseButton[]` |

### isLeftButtonPressed

Checks if the left button is pressed.

| Method | Type |
| ---------- | ---------- |
| `isLeftButtonPressed` | `(event: NormalizedInputEvent) => boolean` |

### isRightButtonPressed

Checks if the right button is pressed.

| Method | Type |
| ---------- | ---------- |
| `isRightButtonPressed` | `(event: NormalizedInputEvent) => boolean` |

### isMiddleButtonPressed

Checks if the middle button is pressed.

| Method | Type |
| ---------- | ---------- |
| `isMiddleButtonPressed` | `(event: NormalizedInputEvent) => boolean` |

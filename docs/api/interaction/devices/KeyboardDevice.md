# KeyboardDevice

Keyboard-specific device utilities.

## Static Methods

- [isKeyPressed](#iskeypressed)
- [isKeyDown](#iskeydown)
- [getKey](#getkey)
- [getCode](#getcode)

### isKeyPressed

Checks if a key is pressed in an event.

| Method | Type |
| ---------- | ---------- |
| `isKeyPressed` | `(event: NormalizedInputEvent, key: string) => boolean` |

### isKeyDown

Checks if a key is currently down in the state.

| Method | Type |
| ---------- | ---------- |
| `isKeyDown` | `(state: InputState, key: string) => boolean` |

### getKey

Gets the normalized key from an event.

| Method | Type |
| ---------- | ---------- |
| `getKey` | `(event: NormalizedInputEvent) => string or undefined` |

### getCode

Gets the physical key code from an event.

| Method | Type |
| ---------- | ---------- |
| `getCode` | `(event: NormalizedInputEvent) => string or undefined` |

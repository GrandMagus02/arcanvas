# InputState

Centralized input state management.
Maintains current state of keys, pointers, modifiers, and click history.

## Methods

- [update](#update)
- [isKeyDown](#iskeydown)
- [getPointer](#getpointer)
- [hasModifier](#hasmodifier)
- [clearClickHistory](#clearclickhistory)
- [snapshot](#snapshot)
- [reset](#reset)
- [setMaxClickHistorySize](#setmaxclickhistorysize)

### update

Updates state from a normalized input event.

| Method | Type |
| ---------- | ---------- |
| `update` | `(event: NormalizedInputEvent) => void` |

### isKeyDown

Checks if a key is currently pressed.

| Method | Type |
| ---------- | ---------- |
| `isKeyDown` | `(key: string) => boolean` |

### getPointer

Gets a specific pointer by ID.

| Method | Type |
| ---------- | ---------- |
| `getPointer` | `(id: number) => PointerState or undefined` |

### hasModifier

Checks if a modifier key is pressed.

| Method | Type |
| ---------- | ---------- |
| `hasModifier` | `(modifier: ModifierKey) => boolean` |

### clearClickHistory

Clears click history.

| Method | Type |
| ---------- | ---------- |
| `clearClickHistory` | `() => void` |

### snapshot

Creates a snapshot of the current state.

| Method | Type |
| ---------- | ---------- |
| `snapshot` | `() => InputStateSnapshot` |

### reset

Resets all state.

| Method | Type |
| ---------- | ---------- |
| `reset` | `() => void` |

### setMaxClickHistorySize

Sets the maximum click history size.

| Method | Type |
| ---------- | ---------- |
| `setMaxClickHistorySize` | `(size: number) => void` |

# Interfaces

- [PointerState](#pointerstate)
- [ClickEvent](#clickevent)
- [InputStateSnapshot](#inputstatesnapshot)

## PointerState

State of an active pointer.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `number` |  |
| `position` | `InputPosition` |  |
| `buttons` | `MouseButton[]` |  |
| `timestamp` | `number` |  |
| `device` | `string` |  |


## ClickEvent

Click event for multi-click detection.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `position` | `InputPosition` |  |
| `timestamp` | `number` |  |
| `button` | `MouseButton` |  |


## InputStateSnapshot

Snapshot of input state at a point in time.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `keysDown` | `Set<string>` |  |
| `activePointers` | `Map<number, PointerState>` |  |
| `modifiers` | `ModifierKey[]` |  |
| `lastPosition` | `InputPosition or null` |  |
| `clickHistory` | `ClickEvent[]` |  |


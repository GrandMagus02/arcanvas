# ShortcutEngine

Engine that processes input events and state to emit action events from shortcut bindings.

## Methods

- [bind](#bind)
- [unbind](#unbind)
- [process](#process)
- [setContext](#setcontext)
- [onAction](#onaction)

### bind

Binds a chord or chord sequence to an action ID.
Supports key sequences like "A + S + D" which require keys to be pressed in order.

| Method | Type |
| ---------- | ---------- |
| `bind` | `(chord: string or Chord or (string or Chord)[], actionId: string, context?: string, priority?: number) => void` |

### unbind

Unbinds a shortcut.

| Method | Type |
| ---------- | ---------- |
| `unbind` | `(actionId: string, context?: string or undefined) => void` |

### process

Processes an input event and emits action events if shortcuts match.

| Method | Type |
| ---------- | ---------- |
| `process` | `(event: NormalizedInputEvent) => void` |

### setContext

Sets the current context.

| Method | Type |
| ---------- | ---------- |
| `setContext` | `(context: string) => void` |

### onAction

Registers a listener for action events.

| Method | Type |
| ---------- | ---------- |
| `onAction` | `(listener: (event: ActionEvent) => void) => () => void` |

# Interfaces

- [ActionEvent](#actionevent)
- [ShortcutEngineOptions](#shortcutengineoptions)

## ActionEvent

Action event emitted when a shortcut is matched.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `actionId` | `string` |  |
| `context` | `string` |  |
| `chord` | `Chord` |  |
| `timestamp` | `number` |  |


## ShortcutEngineOptions

Options for ShortcutEngine.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `sequenceTimeout` | `number or undefined` |  |
| `currentContext` | `string or undefined` |  |


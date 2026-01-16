# Subscribable

A subscribable object that can be used to subscribe to and emit events.

Examples:

```typescript
// Using EventMap (recommended)
interface MyEvents extends EventMap {
  click: [event: MouseEvent];
  resize: [width: number, height: number];
}
class MyClass extends Subscribable<MyEvents> {}

// Using string union (backward compatible)
class MyClass extends Subscribable<"click" | "resize"> {}
```


## Methods

- [on](#on)
- [off](#off)
- [emit](#emit)

### on

Subscribe to an event.

| Method | Type |
| ---------- | ---------- |
| `on` | `<K extends keyof (T extends string ? StringToEventMap<T> : T)>(event: K, fn: (...args: (T extends string ? StringToEventMap<T> : T)[K]) => void) => () => void` |

Parameters:

* `event`: - The event name to subscribe to.
* `fn`: - The callback function to call when the event is emitted.


Returns:

A function to unsubscribe from the event.

### off

Unsubscribe from an event.

| Method | Type |
| ---------- | ---------- |
| `off` | `<K extends keyof (T extends string ? StringToEventMap<T> : T)>(event: K, fn: (...args: (T extends string ? StringToEventMap<T> : T)[K]) => void) => void` |

Parameters:

* `event`: - The event name to unsubscribe from.
* `fn`: - The callback function to remove.


### emit

Emit an event.

| Method | Type |
| ---------- | ---------- |
| `emit` | `<K extends keyof (T extends string ? StringToEventMap<T> : T)>(event: K, ...args: (T extends string ? StringToEventMap<T> : T)[K]) => void` |

Parameters:

* `event`: - The event name to emit.
* `args`: - The arguments to pass to the event handler.


# Types

- [StringToEventMap](#stringtoeventmap)

## StringToEventMap

Helper type to convert a string union to an EventMap.
Useful for backward compatibility with code that uses string event names.

| Type | Type |
| ---------- | ---------- |
| `StringToEventMap` | `Record<T, unknown[]>` |


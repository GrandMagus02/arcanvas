# EventBusMixin

Mixin class that provides type-safe event bus functionality for event-driven objects.

Classes using this mixin will implement the EventEmitter interface,
allowing them to emit and subscribe to events with full type safety.

Examples:

```typescript
interface MyEvents extends EventMap {
  click: [event: MouseEvent];
  resize: [width: number, height: number];
}

class MyClass {
  static {
    applyMixins(MyClass, [EventBusMixin]);
  }

  declare on: <K extends keyof MyEvents>(
    event: K,
    fn: (...args: MyEvents[K]) => void
  ) => () => void;
}

const instance = new MyClass();
instance.on("click", (event) => {
  // TypeScript knows event is MouseEvent
});
```


## Methods

- [on](#on)
- [once](#once)
- [off](#off)
- [emit](#emit)

### on

Subscribe to an event.

| Method | Type |
| ---------- | ---------- |
| `on` | `<K extends keyof T>(event: K, fn: (...args: T[K]) => void) => () => void` |

Parameters:

* `event`: The event name to subscribe to.
* `fn`: The callback function to call when the event is emitted.


Returns:

A function to unsubscribe from the event.

### once

Subscribe to an event once.

| Method | Type |
| ---------- | ---------- |
| `once` | `<K extends keyof T>(event: K, fn: (...args: T[K]) => void) => () => void` |

Parameters:

* `event`: The event name to subscribe to.
* `fn`: The callback function to call when the event is emitted.


Returns:

A function to unsubscribe from the event.

### off

Unsubscribe from an event.

| Method | Type |
| ---------- | ---------- |
| `off` | `<K extends keyof T>(event: K, fn: (...args: T[K]) => void) => void` |

Parameters:

* `event`: The event name to unsubscribe from.
* `fn`: The callback function to remove.


### emit

Emit an event.

| Method | Type |
| ---------- | ---------- |
| `emit` | `<K extends keyof T>(event: K, ...args: T[K]) => void` |

Parameters:

* `event`: The event name to emit.
* `args`: Arguments to pass to event handlers.


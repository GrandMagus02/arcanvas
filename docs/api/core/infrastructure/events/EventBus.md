# EventBus

A type-safe event bus that can be used to emit and subscribe to events.

Examples:

```typescript
interface MyEvents extends EventMap {
  click: [event: MouseEvent];
  resize: [width: number, height: number];
}

const bus = new EventBus<MyEvents>();
bus.on("click", (event) => {
  // TypeScript knows event is MouseEvent
});
bus.emit("resize", 800, 600);
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

### once

Subscribe to an event once.

| Method | Type |
| ---------- | ---------- |
| `once` | `<K extends keyof T>(event: K, fn: (...args: T[K]) => void) => () => void` |

### off

Unsubscribe from an event.

| Method | Type |
| ---------- | ---------- |
| `off` | `<K extends keyof T>(event: K, fn: (...args: T[K]) => void) => void` |

### emit

Emit an event.

| Method | Type |
| ---------- | ---------- |
| `emit` | `<K extends keyof T>(event: K, ...args: T[K]) => void` |

# Types

- [HookFn](#hookfn)

## HookFn

A function that can be used to handle an event.

| Type | Type |
| ---------- | ---------- |
| `HookFn` | `(...args: unknown[]) => void` |


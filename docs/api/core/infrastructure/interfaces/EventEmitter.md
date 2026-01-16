
# Interfaces

- [EventEmitter](#eventemitter)

## EventEmitter

Interface for objects that can emit and subscribe to events with type safety.

| Property | Type | Description |
| ---------- | ---------- | ---------- |


Examples:

```typescript
interface MyEvents extends EventMap {
  click: [event: MouseEvent];
  resize: [width: number, height: number];
}

class MyEmitter implements EventEmitter<MyEvents> {
  on<K extends keyof MyEvents>(event: K, fn: (...args: MyEvents[K]) => void): () => void {
    // implementation
  }
  // ... other methods
}
```


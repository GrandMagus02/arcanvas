
# Types

- [EventMap](#eventmap)

## EventMap

Type definition for event maps.
Maps event names to their argument tuples.

| Type | Type |
| ---------- | ---------- |
| `EventMap` | `Record<string, unknown[]>` |

Examples:

```typescript
interface MyEvents extends EventMap {
  click: [event: MouseEvent];
  resize: [width: number, height: number];
  load: [];
}
```



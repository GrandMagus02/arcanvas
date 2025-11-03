# EventBus

A event bus that can be used to emit and subscribe to events.

## Methods

- [on](#on)
- [once](#once)
- [off](#off)
- [emit](#emit)

### on

| Method | Type |
| ---------- | ---------- |
| `on` | `(event: string, fn: HookFn) => () => void` |

### once

| Method | Type |
| ---------- | ---------- |
| `once` | `(event: string, fn: HookFn) => () => void` |

### off

| Method | Type |
| ---------- | ---------- |
| `off` | `(event: string, fn: HookFn) => void` |

### emit

| Method | Type |
| ---------- | ---------- |
| `emit` | `(event: string, ...args: unknown[]) => void` |

# Types

- [HookFn](#hookfn)

## HookFn

A function that can be used to handle an event.

| Type | Type |
| ---------- | ---------- |
| `HookFn` | `(...args: unknown[]) => void` |


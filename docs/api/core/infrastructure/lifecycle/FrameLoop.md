# FrameLoop

## Methods

- [start](#start)
- [stop](#stop)

### start

| Method | Type |
| ---------- | ---------- |
| `start` | `() => void` |

### stop

| Method | Type |
| ---------- | ---------- |
| `stop` | `() => void` |

# Interfaces

- [FrameLoopOptions](#frameloopoptions)

## FrameLoopOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fixedDeltaMs` | `number or null or undefined` |  |


# Types

- [FrameCallback](#framecallback)

## FrameCallback

FrameLoop schedules update/render ticks using requestAnimationFrame.

| Type | Type |
| ---------- | ---------- |
| `FrameCallback` | `(dtMs: number, timeMs: number) => void` |


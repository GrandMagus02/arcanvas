# Constants

- [DEFAULT_CANVAS_OPTIONS](#default_canvas_options)

## DEFAULT_CANVAS_OPTIONS

Default canvas options.

| Constant | Type |
| ---------- | ---------- |
| `DEFAULT_CANVAS_OPTIONS` | `CanvasOptions` |


# CanvasHost

Manages DOM canvas element, dimensions, DPR, and focus state.

## Methods

- [updateOptions](#updateoptions)
- [resize](#resize)

### updateOptions

| Method | Type |
| ---------- | ---------- |
| `updateOptions` | `(options: Partial<CanvasOptions>) => void` |

### resize

| Method | Type |
| ---------- | ---------- |
| `resize` | `(width: number, height: number) => void` |

# Interfaces

- [CanvasOptions](#canvasoptions)
- [CanvasHostEvents](#canvashostevents)

## CanvasOptions

Options for configuring a canvas host.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `width` | `number` |  |
| `height` | `number` |  |
| `focusable` | `boolean` |  |


## CanvasHostEvents

Event map constraint for CanvasHost.
Ensures the event map includes the events that CanvasHost emits.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `resize` | `[width: number, height: number]` |  |
| `focus` | `[]` |  |
| `blur` | `[]` |  |


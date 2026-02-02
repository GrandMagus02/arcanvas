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
- [setResolutionScale](#setresolutionscale)

### updateOptions

| Method | Type |
| ---------- | ---------- |
| `updateOptions` | `(options: Partial<CanvasOptions>) => void` |

### resize

| Method | Type |
| ---------- | ---------- |
| `resize` | `(width: number, height: number) => void` |

### setResolutionScale

Sets the resolution scale multiplier and applies it.

| Method | Type |
| ---------- | ---------- |
| `setResolutionScale` | `(scale: number) => void` |

Parameters:

* `scale`: - Resolution scale (e.g., 0.5 for pixelated, 2 for supersampling)


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
| `resolutionScale` | `number` | Resolution scale multiplier applied on top of DPR. 1 = native, <1 = lower res (pixelated), >1 = higher res. |


## CanvasHostEvents

Event map constraint for CanvasHost.
Ensures the event map includes the events that CanvasHost emits.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `resize` | `[width: number, height: number]` |  |
| `focus` | `[]` |  |
| `blur` | `[]` |  |


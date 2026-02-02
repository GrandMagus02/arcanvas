# PenDevice

Pen/stylus-specific device utilities.

## Static Methods

- [getPenProperties](#getpenproperties)
- [getPressure](#getpressure)
- [getTiltX](#gettiltx)
- [getTiltY](#gettilty)
- [getTwist](#gettwist)
- [isEraser](#iseraser)
- [getBarrelButton](#getbarrelbutton)
- [isBarrelButtonPressed](#isbarrelbuttonpressed)
- [getPenButton](#getpenbutton)

### getPenProperties

Gets pen properties from an event, or null if not a pen event.

| Method | Type |
| ---------- | ---------- |
| `getPenProperties` | `(event: NormalizedInputEvent) => PenProperties or null` |

### getPressure

Gets pressure from a pen event (0-1).

| Method | Type |
| ---------- | ---------- |
| `getPressure` | `(event: NormalizedInputEvent) => number` |

### getTiltX

Gets tilt X angle from a pen event (in degrees).

| Method | Type |
| ---------- | ---------- |
| `getTiltX` | `(event: NormalizedInputEvent) => number` |

### getTiltY

Gets tilt Y angle from a pen event (in degrees).

| Method | Type |
| ---------- | ---------- |
| `getTiltY` | `(event: NormalizedInputEvent) => number` |

### getTwist

Gets twist angle from a pen event (in degrees), if available.

| Method | Type |
| ---------- | ---------- |
| `getTwist` | `(event: NormalizedInputEvent) => number or undefined` |

### isEraser

Checks if the eraser end is active.

| Method | Type |
| ---------- | ---------- |
| `isEraser` | `(event: NormalizedInputEvent) => boolean` |

### getBarrelButton

Gets the barrel button number if pressed (1 or 2), or undefined.

| Method | Type |
| ---------- | ---------- |
| `getBarrelButton` | `(event: NormalizedInputEvent) => number or undefined` |

### isBarrelButtonPressed

Checks if a specific barrel button is pressed.

| Method | Type |
| ---------- | ---------- |
| `isBarrelButtonPressed` | `(event: NormalizedInputEvent, button: 1 or 2) => boolean` |

### getPenButton

Maps button number to PenButton enum.

| Method | Type |
| ---------- | ---------- |
| `getPenButton` | `(button: number) => PenButton or null` |

# Enum

- [PenButton](#penbutton)

## PenButton

Pen button identifiers.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Tip` | `0` |  |
| `Eraser` | `5` |  |
| `Button1` | `2` |  |
| `Button2` | `3` |  |


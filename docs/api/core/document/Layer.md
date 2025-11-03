# BaseLayer

Base class for all document layers.

## Methods

- [isDirty](#isdirty)
- [markDirty](#markdirty)
- [clearDirty](#cleardirty)
- [getDirtyRect](#getdirtyrect)

### isDirty

Returns true if this layer has changes pending re-render.

| Method | Type |
| ---------- | ---------- |
| `isDirty` | `() => boolean` |

### markDirty

Marks this layer dirty. Optionally merges the provided rect into the dirty area.

| Method | Type |
| ---------- | ---------- |
| `markDirty` | `(rect?: DOMRectReadOnly or undefined) => void` |

### clearDirty

Clears the dirty state and accumulated dirty rectangle.

| Method | Type |
| ---------- | ---------- |
| `clearDirty` | `() => void` |

### getDirtyRect

Returns a copy of the accumulated dirty rectangle, if any.

| Method | Type |
| ---------- | ---------- |
| `getDirtyRect` | `() => DOMRect or null` |

## Properties

- [id](#id)
- [name](#name)
- [parent](#parent)
- [visible](#visible)
- [locked](#locked)
- [opacity](#opacity)
- [blendMode](#blendmode)
- [transform](#transform)

### id

| Property | Type |
| ---------- | ---------- |
| `id` | `string` |

### name

| Property | Type |
| ---------- | ---------- |
| `name` | `string` |

### parent

| Property | Type |
| ---------- | ---------- |
| `parent` | `GroupLayer or null` |

### visible

| Property | Type |
| ---------- | ---------- |
| `visible` | `boolean` |

### locked

| Property | Type |
| ---------- | ---------- |
| `locked` | `boolean` |

### opacity

| Property | Type |
| ---------- | ---------- |
| `opacity` | `number` |

### blendMode

| Property | Type |
| ---------- | ---------- |
| `blendMode` | `BlendMode` |

### transform

| Property | Type |
| ---------- | ---------- |
| `transform` | `Transform2D` |

# GroupLayer

A layer that groups other layers.

## Methods

- [add](#add)
- [remove](#remove)

### add

| Method | Type |
| ---------- | ---------- |
| `add` | `(child: BaseLayer) => void` |

### remove

| Method | Type |
| ---------- | ---------- |
| `remove` | `(child: BaseLayer) => void` |

## Properties

- [children](#children)

### children

| Property | Type |
| ---------- | ---------- |
| `children` | `BaseLayer[]` |

# RasterLayer

A pixel-based layer backed by an OffscreenCanvas (MVP).

## Methods

- [getSurface](#getsurface)

### getSurface

| Method | Type |
| ---------- | ---------- |
| `getSurface` | `() => OffscreenCanvas or null` |

## Properties

- [width](#width)
- [height](#height)

### width

| Property | Type |
| ---------- | ---------- |
| `width` | `number` |

### height

| Property | Type |
| ---------- | ---------- |
| `height` | `number` |

# AdjustmentLayer

A non-destructive adjustment layer (filters applied later phases).

# Interfaces

- [Transform2D](#transform2d)

## Transform2D

A simple 2D transform for layers.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `tx` | `number` |  |
| `ty` | `number` |  |
| `sx` | `number` |  |
| `sy` | `number` |  |
| `rotation` | `number` |  |


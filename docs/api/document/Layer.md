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
- [mask](#mask)

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

### mask

| Property | Type |
| ---------- | ---------- |
| `mask` | `LayerMask or null` |

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
- [getContext2D](#getcontext2d)

### getSurface

| Method | Type |
| ---------- | ---------- |
| `getSurface` | `() => OffscreenCanvas or null` |

### getContext2D

Gets a 2D rendering context with image smoothing disabled for pixel-perfect rendering.
This ensures crisp, vector-like rendering at any zoom level.

| Method | Type |
| ---------- | ---------- |
| `getContext2D` | `() => OffscreenCanvasRenderingContext2D or null` |

## Properties

- [width](#width)
- [height](#height)
- [source](#source)

### width

| Property | Type |
| ---------- | ---------- |
| `width` | `number` |

### height

| Property | Type |
| ---------- | ---------- |
| `height` | `number` |

### source

| Property | Type |
| ---------- | ---------- |
| `source` | `RasterSourceRef or null` |

# VectorLayer

Vector layer stub (for Phase 3).

## Properties

- [shapes](#shapes)

### shapes

| Property | Type |
| ---------- | ---------- |
| `shapes` | `unknown[]` |

# TextLayer

Text layer interface.

## Properties

- [text](#text)
- [style](#style)

### text

| Property | Type |
| ---------- | ---------- |
| `text` | `string` |

### style

| Property | Type |
| ---------- | ---------- |
| `style` | `Record<string, unknown>` |

# AdjustmentLayer

A non-destructive adjustment layer (filters applied later phases).

## Properties

- [adjustmentType](#adjustmenttype)
- [params](#params)

### adjustmentType

| Property | Type |
| ---------- | ---------- |
| `adjustmentType` | `string` |

### params

| Property | Type |
| ---------- | ---------- |
| `params` | `Record<string, unknown>` |

# Interfaces

- [Transform2D](#transform2d)
- [LayerMask](#layermask)

## Transform2D

A simple 2D transform for layers.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `tx` | `number` |  |
| `ty` | `number` |  |
| `sx` | `number` |  |
| `sy` | `number` |  |
| `rotation` | `number` |  |


## LayerMask

Layer mask interface (for Phase 4).

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `source` | `unknown` |  |
| `inverted` | `boolean` |  |


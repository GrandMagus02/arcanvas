# Polygon2DObject

Engine-level 2D polygon render object using the new mesh/material pipeline.
Implements ISelectable for selection support.

## Methods

- [getOriginalPoints](#getoriginalpoints)
- [getBounds](#getbounds)
- [isVisible](#isvisible)
- [setVisible](#setvisible)

### getOriginalPoints

Gets the original polygon points in local space.

| Method | Type |
| ---------- | ---------- |
| `getOriginalPoints` | `() => { x: number; y: number; }[]` |

### getBounds

Gets the bounding box of this polygon in world space.

| Method | Type |
| ---------- | ---------- |
| `getBounds` | `() => BoundingBox2D or null` |

### isVisible

Checks if this object is visible.

| Method | Type |
| ---------- | ---------- |
| `isVisible` | `() => boolean` |

### setVisible

Sets the visibility of this object.

| Method | Type |
| ---------- | ---------- |
| `setVisible` | `(visible: boolean) => void` |

# Interfaces

- [Polygon2DObjectOptions](#polygon2dobjectoptions)

## Polygon2DObjectOptions

Options for creating a Polygon2DObject.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `zIndex` | `number or undefined` |  |
| `id` | `string or undefined` |  |
| `visible` | `boolean or undefined` |  |


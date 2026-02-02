# HandleSet

Collection of handles for a selected object.

## Methods

- [add](#add)
- [remove](#remove)
- [clear](#clear)
- [getHandleAt](#gethandleat)
- [render](#render)

### add

Adds a handle to this set.

| Method | Type |
| ---------- | ---------- |
| `add` | `(handle: Handle) => void` |

### remove

Removes a handle from this set.

| Method | Type |
| ---------- | ---------- |
| `remove` | `(handle: Handle) => void` |

### clear

Clears all handles from this set.

| Method | Type |
| ---------- | ---------- |
| `clear` | `() => void` |

### getHandleAt

Gets a handle at a specific point (for hit-testing).

| Method | Type |
| ---------- | ---------- |
| `getHandleAt` | `(point: { x: number; y: number; }, pixelSize?: number) => Handle or null` |

Parameters:

* `point`: - Point to test in world coordinates
* `pixelSize`: - Size of a pixel in world units


Returns:

The handle at the point, or null if none found

### render

Renders all handles using the provided renderer.

| Method | Type |
| ---------- | ---------- |
| `render` | `(renderer: IHandleRenderer, context: RenderContext) => void` |

Parameters:

* `renderer`: - The handle renderer to use
* `context`: - Rendering context


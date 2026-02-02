# HandleRenderer2D

2D handle renderer implementation.
Renders selection handles and outlines using WebGL or Canvas2D.

## Methods

- [renderHandle](#renderhandle)
- [renderHandleSet](#renderhandleset)
- [renderOutline](#renderoutline)
- [worldToScreen](#worldtoscreen)
- [screenToWorld](#screentoworld)

### renderHandle

Renders a single handle.

| Method | Type |
| ---------- | ---------- |
| `renderHandle` | `(handle: Handle, context: RenderContext) => void` |

Parameters:

* `handle`: - The handle to render
* `context`: - Rendering context


### renderHandleSet

Renders a set of handles.

| Method | Type |
| ---------- | ---------- |
| `renderHandleSet` | `(handleSet: HandleSet, context: RenderContext) => void` |

Parameters:

* `handleSet`: - The set of handles to render
* `context`: - Rendering context


### renderOutline

Renders the selection outline (bounding box border).

| Method | Type |
| ---------- | ---------- |
| `renderOutline` | `(bounds: unknown, context: RenderContext) => void` |

Parameters:

* `bounds`: - The bounding box to outline (should be BoundingBox2D)
* `context`: - Rendering context


### worldToScreen

Converts world coordinates to screen coordinates.

| Method | Type |
| ---------- | ---------- |
| `worldToScreen` | `(worldPoint: { x: number; y: number; }, context: RenderContext) => { x: number; y: number; }` |

Parameters:

* `worldPoint`: - Point in world coordinates
* `context`: - Rendering context with camera


Returns:

Point in screen coordinates (pixels)

### screenToWorld

Converts screen coordinates to world coordinates.

| Method | Type |
| ---------- | ---------- |
| `screenToWorld` | `(screenPoint: { x: number; y: number; }, context: RenderContext) => { x: number; y: number; }` |

Parameters:

* `screenPoint`: - Point in screen coordinates (pixels)
* `context`: - Rendering context with camera


Returns:

Point in world coordinates

## Properties

- [handleSize](#handlesize)
- [handleColor](#handlecolor)
- [outlineColor](#outlinecolor)
- [outlineWidth](#outlinewidth)
- [canvasContext](#canvascontext)

### handleSize

Size of handles in pixels.

| Property | Type |
| ---------- | ---------- |
| `handleSize` | `number` |

### handleColor

Color of handles (RGBA).

| Property | Type |
| ---------- | ---------- |
| `handleColor` | `[number, number, number, number]` |

### outlineColor

Color of selection outline (RGBA).

| Property | Type |
| ---------- | ---------- |
| `outlineColor` | `[number, number, number, number]` |

### outlineWidth

Width of selection outline in pixels.

| Property | Type |
| ---------- | ---------- |
| `outlineWidth` | `number` |

### canvasContext

Canvas2D context for rendering handles and outlines.
Set this to enable visual rendering.

| Property | Type |
| ---------- | ---------- |
| `canvasContext` | `CanvasRenderingContext2D or null` |
